import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Lấy danh mục khi component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Khi activeCategory thay đổi, gọi API lấy khóa học theo danh mục
  useEffect(() => {
    if (activeCategory) {
      fetchCoursesByCategory(activeCategory.id);
    }
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      const catData = Array.isArray(response.data) ? response.data : [];
      setCategories(catData);
      // Chọn danh mục đầu tiên làm active mặc định nếu có
      if (catData.length > 0) {
        setActiveCategory(catData[0]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Hàm lấy khóa học theo danh mục
  const fetchCoursesByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/courses/by-category/${categoryId}`);
      const retrievedCourses = Array.isArray(response.data) ? response.data : [];
      // Thêm thuộc tính thời lượng khóa học giả định (10-40 giờ) nếu cần
      const coursesWithDuration = retrievedCourses.map(course => ({
        ...course,
        duration: `${Math.floor(Math.random() * 30) + 10} giờ`
      }));
      setCourses(coursesWithDuration);
      setError('');
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className="homepage">
      {/* Banner */}
      <header className="banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1>Học Lập Trình Miễn Phí 100% <span className="star">⭐</span></h1>
          <p>Tuyển tập các khóa học lập trình hay nhất dành cho người mới bắt đầu đến chuyên nghiệp</p>
          <button className="cta-button">Học thử miễn phí</button>
          <img 
            src="https://via.placeholder.com/300x200?text=HTML+CSS+Pro" 
            alt="HTML CSS Pro" 
            className="banner-image" 
          />
        </div>

        {/* Tabs danh mục */}
        <div className="banner-tabs">
          {categories.map(cat => (
            <a
              href="#!"
              key={cat.id}
              className={`banner-tab ${activeCategory && activeCategory.id === cat.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleTabChange(cat);
              }}
            >
              {cat.name}
            </a>
          ))}
        </div>
      </header>

      {/* Featured Courses */}
      <section className="featured-courses">
        <h2>Khóa học thuộc danh mục: {activeCategory ? activeCategory.name : ''}</h2>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="courses-grid">
            {courses.length > 0 ? (
              courses.map(course => (
                <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
                  <div className="course-header" style={{ background: course.headerBg || 'linear-gradient(45deg, #ff6f61, #a300cc)' }}>
                    <span className="course-star">⭐</span>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-subtitle">Cho người mới bắt đầu</p>
                  </div>
                  <div className="course-body">
                    <img
                      src={course.image || `https://via.placeholder.com/300x200?text=${course.title}`}
                      alt={course.title}
                      className="course-image"
                    />
                    <div className="course-info">
                      <p className="course-instructor">👨‍🏫 Giảng viên: {course.instructor}</p>
                      <p className="course-duration">⏱️ Thời lượng: {course.duration}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div>Không có khóa học nào cho danh mục này</div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
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
          <li className="menu__item"><a className="menu__link" href="#">Trang chủ</a></li>
          <li className="menu__item"><a className="menu__link" href="#">Giới thiệu</a></li>
          <li className="menu__item"><a className="menu__link" href="#">Dịch vụ</a></li>
          <li className="menu__item"><a className="menu__link" href="#">Đội ngũ</a></li>
          <li className="menu__item"><a className="menu__link" href="#">Liên hệ</a></li>
        </ul>
        <p>©2025 LuanAcademy | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;