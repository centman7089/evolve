const express = require('express');
const router = express.Router();
const {
  registerUser,
  getAllRegistrations,
  getUsersFiltered,
  exportUsersAsExcel,
  deleteUser
} = require('../controllers/registrationControllers');

// POST - Register user
router.post('/register', registerUser);

// GET - Fetch all registered users
router.get( '/registrations', getAllRegistrations );
router.get( '/filter', getUsersFiltered );
router.get( '/export/excel', exportUsersAsExcel );
router.delete('/delete/:id', deleteUser);


module.exports = router;
