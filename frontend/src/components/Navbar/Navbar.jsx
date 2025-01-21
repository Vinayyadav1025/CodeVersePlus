import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Navbar.css";

const Navbar = () => {
  const logo = require('../../assets/logo.png');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref for dropdown

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    const storedProfileImage = localStorage.getItem('profileImage');
    setProfileImage(storedProfileImage || '');
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('profileImage');
    setIsLoggedIn(false);
    navigate('/signin');
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h3>
        <Link to="/">  {/* Wrap the image with Link to make it clickable */}
            <img src={logo} alt="CodeVerse+" className="navbar-logo" />
          </Link>
        </h3>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/problems">Problems</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/about">About</Link></li>
          {isLoggedIn ? (
            <li className="dropdown-container" ref={dropdownRef}>
              <button className="dropdown-button" onClick={toggleDropdown}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className="placeholder-image" />
                )}
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <li><Link to="/userProfile" onClick={closeDropdown}>View Profile</Link></li>
                  <li onClick={() => { closeDropdown(); handleLogout(); }}>Logout</li>
                </div>
              )}
            </li>
          ) : (
            <li><Link to="/signin">Sign in</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
