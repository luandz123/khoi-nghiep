import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaLinkedinIn, 
  FaTiktok, 
  FaYoutube, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaClock,
  FaAngleRight,
  FaBook,
  FaGraduationCap,
  FaShoppingBag
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Loại bỏ phần hiệu ứng sóng
      <div className="waves">
        <div className="wave" id="wave1"></div>
        <div className="wave" id="wave2"></div>
      </div>
      */}
      
      <div className="footer-container">
        <div className="footer-top">
          {/* Column 1 - About */}
          <div className="footer-column">
            <h3>Về LuanAcademy</h3>
            <p style={{ color: '#cbd5e1', marginBottom: '20px', lineHeight: '1.6' }}>
              LuanAcademy là nền tảng học tập trực tuyến hàng đầu, cung cấp các khóa học chất lượng cao về lập trình và công nghệ.
            </p>
            <div className="social-icons">
              <a href="https://www.facebook.com/luan25032005" className="social-icon" target="_blank" rel="noopener noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://www.tiktok.com/@luantryhard" className="social-icon" target="_blank" rel="noopener noreferrer">
                <FaTiktok />
              </a>
              <a href="https://www.linkedin.com/in/lu%E1%BA%ADn-nguy%E1%BB%85n-v%C4%83n-6018b42ba/" className="social-icon" target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn />
              </a>
              <a href="https://www.youtube.com/@withme-h2o" className="social-icon" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
            </div>
          </div>
          
          {/* Column 2 - Useful Links */}
          <div className="footer-column">
            <h3>Liên kết nhanh</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">
                  <FaAngleRight /> Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/courses">
                  <FaBook /> Khóa học
                </Link>
              </li>
              <li>
                <Link to="/my-courses">
                  <FaGraduationCap /> Khóa học của tôi
                </Link>
              </li>
              <li>
                <Link to="/news">
                  <FaAngleRight /> Tin tức
                </Link>
              </li>
              <li>
                <Link to="/products">
                  <FaShoppingBag /> Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about">
                  <FaAngleRight /> Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <FaAngleRight /> Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3 - Contact Info */}
          <div className="footer-column">
            <h3>Thông tin liên hệ</h3>
            <div className="contact-info">
              <FaMapMarkerAlt />
              <div>97 Man Thiện, Quận 9, TP.HCM</div>
            </div>
            <div className="contact-info">
              <FaPhoneAlt />
              <div>+84 923 456 789</div>
            </div>
            <div className="contact-info">
              <FaEnvelope />
              <div>support@luanacademy.com</div>
            </div>
            <div className="contact-info">
              <FaClock />
              <div>8:00 - 17:00, Thứ Hai - Thứ Sáu</div>
            </div>
          </div>
          
          {/* Column 4 - Newsletter */}
          <div className="footer-column">
            <h3>Nhận tin mới</h3>
            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
              Đăng ký để nhận thông tin về các khóa học mới và ưu đãi đặc biệt.
            </p>
            <div className="footer-form">
              <input type="email" placeholder="Email của bạn" />
              <button type="submit">Đăng ký</button>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>©2025 LuanAcademy | Tất cả quyền được bảo lưu</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;