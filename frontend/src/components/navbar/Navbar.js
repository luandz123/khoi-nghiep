import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaBook, FaNewspaper, FaBox, FaSearch, FaUser, FaUserCircle,
  FaHeart, FaShoppingCart, FaBell, FaSignOutAlt, FaCog, FaGraduationCap 
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState("User");
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const userMenuRef = useRef(null);
  const coursesDropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra đường dẫn hiện tại để thêm class active
  const isActive = (path) => location.pathname === path;
  
  // Xử lý scroll hiệu ứng
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
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

  // Kiểm tra số lượng giỏ hàng từ localStorage
  useEffect(() => {
    const getCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(cart.length);
    };
    
    getCartCount();
    window.addEventListener('storage', getCartCount);
    
    return () => {
      window.removeEventListener('storage', getCartCount);
    };
  }, []);

  useEffect(() => {
    checkAuth();
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setShowCoursesDropdown(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setShowProductsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'username') {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [location, checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/");
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleCoursesDropdown = () => {
    setShowCoursesDropdown(!showCoursesDropdown);
  };

  const toggleProductsDropdown = () => {
    setShowProductsDropdown(!showProductsDropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="logo">
            <span className="logo-accent">Luan</span>Academy
          </Link>
        </div>
        
        <div className="navbar-center">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <FaHome className="nav-icon" />
            <span>Trang Chủ</span>
          </Link>
          
          {/* Dropdown for Courses */}
          <div 
            className="nav-dropdown"
            ref={coursesDropdownRef}
          >
            <div 
              className={`nav-link ${isActive('/courses') || isActive('/my-courses') ? 'active' : ''}`}
              onClick={toggleCoursesDropdown}
              onMouseEnter={() => setShowCoursesDropdown(true)}
            >
              <FaBook className="nav-icon" />
              <span>Khóa Học</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {showCoursesDropdown && (
              <div 
                className="dropdown-menu courses-dropdown"
                onMouseLeave={() => setShowCoursesDropdown(false)}
              >
                <Link to="/courses" className="dropdown-item">
                  <FaBook className="dropdown-icon" />
                  Danh sách khóa học
                </Link>
                {isLoggedIn && (
                  <Link to="/my-courses" className="dropdown-item">
                    <FaGraduationCap className="dropdown-icon" />
                    Khóa học của tôi
                  </Link>
                )}
                <Link to="/courses/featured" className="dropdown-item">
                  <FaBook className="dropdown-icon" />
                  Khóa học nổi bật
                </Link>
                <Link to="/courses/new" className="dropdown-item">
                  <FaBook className="dropdown-icon" />
                  Khóa học mới
                </Link>
              </div>
            )}
          </div>
          
          <Link to="/news" className={`nav-link ${isActive('/news') ? 'active' : ''}`}>
            <FaNewspaper className="nav-icon" />
            <span>Tin Tức</span>
          </Link>
          
          {/* Products Dropdown */}
          <div 
            className="nav-dropdown"
            ref={productsDropdownRef}
          >
            <div 
              className={`nav-link ${isActive('/products') ? 'active' : ''}`}
              onClick={toggleProductsDropdown}
              onMouseEnter={() => setShowProductsDropdown(true)}
            >
              <FaBox className="nav-icon" />
              <span>Sản Phẩm</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {showProductsDropdown && (
              <div 
                className="dropdown-menu products-dropdown"
                onMouseLeave={() => setShowProductsDropdown(false)}
              >
                <Link to="/products" className="dropdown-item">
                  <FaBox className="dropdown-icon" />
                  Tất cả sản phẩm
                </Link>
                <Link to="/products/tech" className="dropdown-item">
                  <FaBox className="dropdown-icon" />
                  Sản phẩm công nghệ
                </Link>
                <Link to="/products/books" className="dropdown-item">
                  <FaBook className="dropdown-icon" />
                  Sách IT
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="navbar-right">
          <form onSubmit={handleSearch} className="search-container">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="search-input" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
          
          {isLoggedIn ? (
            <div className="user-actions">
              <Link to="/wishlist" className="icon-button" title="Yêu thích">
                <FaHeart />
              </Link>
              <Link to="/cart" className="icon-button cart-icon" title="Giỏ hàng">
                <FaShoppingCart />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
              <Link to="/notifications" className="icon-button" title="Thông báo">
                <FaBell />
              </Link>
              <div className="user-dropdown" ref={userMenuRef}>
                <div className="user-menu" onClick={toggleUserMenu}>
                  <FaUserCircle className="user-icon" />
                  <span className="username">{username}</span>
                </div>
                {showUserMenu && (
                  <div className="dropdown-menu user-dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <FaUser className="dropdown-icon" /> Hồ sơ
                    </Link>
                    <Link to="/my-courses" className="dropdown-item">
                      <FaGraduationCap className="dropdown-icon" /> Khóa học của tôi
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <FaCog className="dropdown-icon" /> Cài đặt
                    </Link>
                    {localStorage.getItem('role') === 'ADMIN' && (
                      <Link to="/admin" className="dropdown-item admin-link">
                        <FaCog className="dropdown-icon" /> Trang Admin
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <FaSignOutAlt className="dropdown-icon" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Đăng nhập</Link>
              <Link to="/register" className="register-btn">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;