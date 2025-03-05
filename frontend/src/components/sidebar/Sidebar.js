import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaNewspaper, FaBox } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation(); // Lấy đường dẫn hiện tại

  // Xác định đường dẫn hiện tại để thêm class active
  const isActive = (path) => location.pathname === path;

  return (
    
    <div id="nav-bar">
      
  
      <div id="nav-content">
        <div className="nav-button">
          <Link to="/" className={`menu-link ${isActive('/') ? 'active' : ''}`}>
            <FaHome className="menu-icon" />
            <span className="menu-text">Trang Chủ</span>
          </Link>
        </div>
        <div className="nav-button">
          <Link to="/courses" className={`menu-link ${isActive('/courses') ? 'active' : ''}`}>
            <FaBook className="menu-icon" />
            <span className="menu-text">Khóa Học</span>
          </Link>
        </div>
        <div className="nav-button">
          <Link to="/news" className={`menu-link ${isActive('/news') ? 'active' : ''}`}>
            <FaNewspaper className="menu-icon" />
            <span className="menu-text">Tin Tức</span>
          </Link>
        </div>
        <div className="nav-button">
          <Link to="/products" className={`menu-link ${isActive('/products') ? 'active' : ''}`}>
            <FaBox className="menu-icon" />
            <span className="menu-text">Sản Phẩm</span>
          </Link>
        </div>
      </div>

      <div id="nav-footer">
        <p className="footer-text">©2025 LuanAcademy | All Rights Reserved</p>
      </div>
    </div>
  );
};

// Loại bỏ propTypes vì không còn sử dụng isExpanded và toggleSidebar
export default Sidebar;