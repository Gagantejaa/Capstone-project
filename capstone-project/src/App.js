import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import UserProfile from './components/UserProfile/UserProfile';
import SignUp from './components/Signup/SignUp';
import { UserProvider, UserContext } from '../src/context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { FaTachometerAlt, FaUser, FaSignInAlt, FaSignOutAlt, FaUserPlus } from 'react-icons/fa'; // Import icons
import './App.css'; // Import custom styles

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <Nav />
          <div className="content container mt-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profiles" element={<UserProfile />} />
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

const Nav = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary"> {/* Blue navbar */}
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand">
          <FaTachometerAlt className="me-2" />
          Agile Tracking System
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <FaTachometerAlt className="me-1" /> Dashboard
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/profiles"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <FaUser className="me-1" /> Profiles
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light ms-2" // Light outline for contrast
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-1" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/login"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <FaSignInAlt className="me-1" /> Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/signup"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <FaUserPlus className="me-1" /> Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default App;