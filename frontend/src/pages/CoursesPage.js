import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get('/courses');
        const retrievedCourses = Array.isArray(response.data) ? response.data : [];
        // Lấy 6 khóa học đầu tiên làm khóa học nổi bật
        setCourses(retrievedCourses.slice(0, 6));
        setError('');
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">Online Academy</div>
          <ul className="nav-menu">
            <li><a href="/">Trang Chủ</a></li>
            <li><a href="/courses">Khóa Học</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/login">Đăng Nhập</a></li>
          </ul>
        </div>
      </nav>

      {/* Header mới với background ảnh */}
      <header className="banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1>Học lập trình để đi làm</h1>
          <p>Tham gia khóa học, trải nghiệm kiến thức và phát triển sự nghiệp của bạn</p>
          <button className="cta-button">Xem thêm</button>
        </div>
      </header>

      {/* Featured Courses */}
      <section className="featured-courses">
        <h2>Khóa học nổi bật</h2>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
                <img
                  src={course.image || `https://via.placeholder.com/300x200?text=${course.title}`}
                  alt={course.title}
                  className="course-image"
                />
                <h3 className="course-title">{course.title}</h3>
                <p className="course-instructor">Giảng viên: {course.instructor}</p>
                <p className="course-students">Số học viên: {course.studentsCount}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer với hiệu ứng sóng */}
      <footer className="footer">
        <div className="waves">
          <div className="wave" id="wave1"></div>
          <div className="wave" id="wave2"></div>
          <div className="wave" id="wave3"></div>
          <div className="wave" id="wave4"></div>
        </div>
        <ul className="social-icon">
          <li className="social-icon__item">
            <a className="social-icon__link" href="#">
              <ion-icon name="logo-facebook"></ion-icon>
            </a>
          </li>
          <li className="social-icon__item">
            <a className="social-icon__link" href="#">
              <ion-icon name="logo-twitter"></ion-icon>
            </a>
          </li>
          <li className="social-icon__item">
            <a className="social-icon__link" href="#">
              <ion-icon name="logo-linkedin"></ion-icon>
            </a>
          </li>
          <li className="social-icon__item">
            <a className="social-icon__link" href="#">
              <ion-icon name="logo-instagram"></ion-icon>
            </a>
          </li>
        </ul>
        <ul className="menu">
          <li className="menu__item"><a className="menu__link" href="#">Home</a></li>
          <li className="menu__item"><a className="menu__link" href="#">About</a></li>
          <li className="menu__item"><a className="menu__link" href="#">Services</a></li>
          <li className="menu__item"><a className="menu__link" href="#">Team</a></li>
          <li className="menu__item"><a className="menu__link" href="#">Contact</a></li>
        </ul>
        <p>&copy;2021 Nadine Coelho | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;