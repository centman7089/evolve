// @ts-nocheck
import React, { useState } from 'react';
import axios from 'axios';

const UserFilterTest = () => {
  const [filters, setFilters] = useState({
    search: '',
    session: '',
    date: '',
    location: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Convert empty strings to undefined to avoid sending empty params
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );

      const response = await axios.get('http://localhost:3000/api/registrations', {
        params,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setResults(response.data.data || []);
    } catch (err) {
      if (err.response) {
        // Handle 400, 404, etc.
        setError(err.response.data.message || 'Error fetching data');
      } else {
        setError(err.message);
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="filter-test-container">
      <h2>Test Strict User Filters</h2>
      
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="form-group">
          <label>Search (name/email):</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Case-sensitive search"
          />
        </div>

        <div className="form-group">
          <label>Session:</label>
          <select
            name="session"
            value={filters.session}
            onChange={handleChange}
          >
            <option value="">Select session</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Case-sensitive location"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="results-section">
        <h3>Results ({results.length})</h3>
        {results.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Session</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map(user => (
                <tr key={user._id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.location}</td>
                  <td>{user.selectedSession}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p>No results found. Try different filters.</p>
        )}
      </div>
    </div>
  );
};

export default UserFilterTest;