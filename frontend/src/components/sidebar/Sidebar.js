import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaBook, FaNewspaper, FaBox, FaGraduationCap, 
  FaUserGraduate, FaChalkboardTeacher, FaStar, FaChevronDown,
  FaListAlt, FaQuestionCircle, FaShoppingBag
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [showCourseSubmenu, setShowCourseSubmenu] = useState(false);
  const [showProductSubmenu, setShowProductSubmenu] = useState(false);

  // Xác định đường dẫn hiện tại để thêm class active
  const isActive = (path) => location.pathname === path;
  const isSubActive = (paths) => paths.some(path => location.pathname.includes(path));

  return (
    <div id="nav-bar">
      <div id="nav-content">
        <div className="nav-button">
          <Link to="/" className={`menu-link ${isActive('/') ? 'active' : ''}`}>
            <FaHome className="menu-icon" />
            <span className="menu-text">Trang Chủ</span>
          </Link>
        </div>
        
        {/* Khóa học dropdown */}
        <div className="nav-button">
          <div 
            className={`menu-link ${isSubActive(['/courses', '/my-courses']) ? 'active' : ''}`}
            onClick={() => setShowCourseSubmenu(!showCourseSubmenu)}
          >
            <FaBook className="menu-icon" />
            <span className="menu-text">Khóa Học</span>
            <FaChevronDown className={`submenu-icon ${showCourseSubmenu ? 'rotate' : ''}`} />
          </div>
          
          {showCourseSubmenu && (
            <div className="submenu">
              <Link to="/courses" className={`submenu-link ${isActive('/courses') ? 'active' : ''}`}>
                <FaListAlt className="submenu-icon" />
                <span>Tất cả khóa học</span>
              </Link>
              <Link to="/my-courses" className={`submenu-link ${isActive('/my-courses') ? 'active' : ''}`}>
                <FaUserGraduate className="submenu-icon" />
                <span>Khóa học của tôi</span>
              </Link>
              <Link to="/courses/featured" className={`submenu-link ${isActive('/courses/featured') ? 'active' : ''}`}>
                <FaStar className="submenu-icon" />
                <span>Khóa học nổi bật</span>
              </Link>
              <Link to="/courses/new" className={`submenu-link ${isActive('/courses/new') ? 'active' : ''}`}>
                <FaChalkboardTeacher className="submenu-icon" />
                <span>Khóa học mới</span>
              </Link>
            </div>
          )}
        </div>
        
        <div className="nav-button">
          <Link to="/news" className={`menu-link ${isActive('/news') ? 'active' : ''}`}>
            <FaNewspaper className="menu-icon" />
            <span className="menu-text">Tin Tức</span>
          </Link>
        </div>
        
        {/* Sản phẩm dropdown */}
        <div className="nav-button">
          <div 
            className={`menu-link ${isSubActive(['/products']) ? 'active' : ''}`}
            onClick={() => setShowProductSubmenu(!showProductSubmenu)}
          >
            <FaBox className="menu-icon" />
            <span className="menu-text">Sản Phẩm</span>
            <FaChevronDown className={`submenu-icon ${showProductSubmenu ? 'rotate' : ''}`} />
          </div>
          
          {showProductSubmenu && (
            <div className="submenu">
              <Link to="/products" className={`submenu-link ${isActive('/products') ? 'active' : ''}`}>
                <FaBox className="submenu-icon" />
                <span>Tất cả sản phẩm</span>
              </Link>
              <Link to="/products/tech" className={`submenu-link ${isActive('/products/tech') ? 'active' : ''}`}>
                <FaBox className="submenu-icon" />
                <span>Sản phẩm công nghệ</span>
              </Link>
              <Link to="/products/books" className={`submenu-link ${isActive('/products/books') ? 'active' : ''}`}>
                <FaBook className="submenu-icon" />
                <span>Sách IT</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* Các liên kết khác - hiển thị với người dùng đã đăng nhập */}
        {localStorage.getItem('token') && (
          <>
            <div className="nav-divider"></div>
            
            <div className="nav-button">
              <Link to="/my-courses" className={`menu-link ${isActive('/my-courses') ? 'active' : ''}`}>
                <FaGraduationCap className="menu-icon" />
                <span className="menu-text">Khóa học của tôi</span>
              </Link>
            </div>
            
            <div className="nav-button">
              <Link to="/cart" className={`menu-link ${isActive('/cart') ? 'active' : ''}`}>
                <FaShoppingBag className="menu-icon" />
                <span className="menu-text">Giỏ hàng</span>
              </Link>
            </div>
            
            <div className="nav-button">
              <Link to="/help" className={`menu-link ${isActive('/help') ? 'active' : ''}`}>
                <FaQuestionCircle className="menu-icon" />
                <span className="menu-text">Hỗ trợ</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;