import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Về LuanAcademy</h3>
          <ul className="footer-links">
            <li><Link to="/about">Giới thiệu</Link></li>
            <li><Link to="/services">Dịch vụ</Link></li>
            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            <li><Link to="/terms">Điều khoản sử dụng</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Khóa học</h3>
          <ul className="footer-links">
            <li><Link to="/courses?category=web">Lập trình web</Link></li>
            <li><Link to="/courses?category=mobile">Lập trình di động</Link></li>
            <li><Link to="/courses?category=data">Khoa học dữ liệu</Link></li>
            <li><Link to="/courses?category=design">Thiết kế UX/UI</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Hỗ trợ</h3>
          <ul className="footer-links">
            <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
            <li><Link to="/support">Trung tâm hỗ trợ</Link></li>
            <li><Link to="/feedback">Góp ý</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Liên hệ</h3>
          <p className="contact-info">Email: info@luanacademy.com</p>
          <div className="phone-tooltip">
            <p className="contact-info">Liên hệ ngay</p>
            <span className="tooltiptext">0123 456 789</span>
          </div>
          <p className="contact-info">Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p>© {new Date().getFullYear()} LuanAcademy. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;