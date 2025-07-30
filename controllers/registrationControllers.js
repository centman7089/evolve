// @ts-nocheck
const Registration = require( '../models/Registration.js' );
const ExcelJS = require('exceljs');
const PARTICIPATION_MODES = require('../constants/participationModes.js');


const formatTitleCase = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      courseOfInterest,
      selectedSession
    } = req.body;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await Registration.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

       // Normalize participation mode (default to Virtual)
       let mode = 'Morning';
       if (selectedSession) {
         const formatted = formatTitleCase(selectedSession);
         if (PARTICIPATION_MODES.includes(formatted)) {
           mode = formatted;
         } else {
           return res.status(400).json({ message: `Invalid selectedSession. Use one of: ${PARTICIPATION_MODES.join(', ')}` });
         }
       }

    // Create new registration
    const registration = new Registration({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      location,
      courseOfInterest,
      selectedSession: mode
    });

    await registration.save();

    res.status(201).json({
      message: 'Registration successful',
      user: registration,
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// const getAllRegistrations = async (req, res) => {
//     try {
//       const registrations = await Registration.find().sort({ registeredAt: -1 }); // latest first
//       res.status(200).json(registrations);
//     } catch ( error )
//     {
//       console.log(error);
//       res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
//     }
// };

const getAllRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // Default to page 1
    const limit = parseInt(req.query.limit) || 25;   // Default to 25 records per page
    const skip = (page - 1) * limit;

    const total = await Registration.countDocuments(); // Total number of records
    const registrations = await Registration.find()
      .sort({ createdAt: -1 }) // Assuming createdAt is the correct field
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      registrations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
};




const getUsersFiltered = async (req, res) => {
  try {
    const { search, session, date, location } = req.query;

    const query = {};

    // 🔍 Search by name or email
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // 🎯 Filter strictly by session: Morning or Evening
    const allowedSessions = ['Morning', 'Evening'];
    if (session && allowedSessions.includes(session)) {
      query.selectedSession = session;
    }

    // 📆 Filter by specific date
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    // 🌍 Filter by exact location string
    if (location) {
      query.location = location;
    }

    const users = await Registration.find(query).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Export to Excel
const exportUsersAsExcel = async (req, res) => {
  try {
    const users = await Registration.find().lean();

    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registered Users');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Course of Interest', key: 'courseOfInterest', width: 25 },
      { header: 'Seat Reservations', key: 'seatReservations', width: 20 },
      { header: 'Selected Session', key: 'selectedSession', width: 25 },
      { header: 'Country', key: 'country', width: 20 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'Registration Date', key: 'createdAt', width: 25 }
    ];

    // Add rows
    users.forEach(user => {
      worksheet.addRow({
        ...user,
        createdAt: new Date(user.createdAt).toLocaleString()
      });
    });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="evolve_africa_users.xlsx"');

    // Send the Excel file as stream
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await Registration.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

module.exports = { registerUser, getAllRegistrations, getUsersFiltered, exportUsersAsExcel, deleteUser };
