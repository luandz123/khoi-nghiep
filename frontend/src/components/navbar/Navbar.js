import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaUserCircle, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState("User");
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Create a checkAuth function that can be reused
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      
      // Get username from localStorage if available
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
      
      return true;
    } else {
      setIsLoggedIn(false);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check authentication when component mounts
    checkAuth();
    
    // Add event listener to close menu when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // Setup event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        checkAuth();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuth]);

  // Listen for location changes to check auth status
  useEffect(() => {
    checkAuth();
  }, [location, checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setShowUserMenu(false);
    navigate("/");
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="logo">LuanAcademy</Link>
        </div>
        
        <div className="navbar-center">
          <Link to="/">Trang Chủ</Link>
          <Link to="/my-courses">Khóa Học Của TôiTôi</Link>
          <Link to="/blog">Blog</Link>
        </div>
        
        <div className="navbar-right">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
          {isLoggedIn ? (
            <div className="user-dropdown" ref={userMenuRef}>
              <div className="user-menu" onClick={toggleUserMenu}>
                <FaUserCircle className="user-icon" />
                <span className="username">{username}</span>
              </div>
              {showUserMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <FaUser /> Hồ sơ
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <FaCog /> Cài đặt
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="login-btn">Đăng nhập</Link>
              <Link to="/register" className="register-btn">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;