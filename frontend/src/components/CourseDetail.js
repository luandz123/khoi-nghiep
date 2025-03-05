import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/courses/${id}/detail`)
      .then((res) => res.json())
      .then((data) => {
        const enhancedData = {
          ...data,
          instructor: data.instructor || 'Sơn Đặng',
          duration: data.duration || `${Math.floor(Math.random() * 30) + 10} giờ`,
          level: data.level || 'Người mới bắt đầu',
          studentsCount: data.studentsCount || Math.floor(Math.random() * 1000) + 100,
        };
        setCourseDetail(enhancedData);
      })
      .catch((error) => console.error('Error fetching course details:', error));
  }, [id]);

  const getYoutubeEmbedUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
      } else if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      return url;
    }
  };

  const enrollCourse = () => {
    setLoading(true);
    // Lấy token đã lưu ở localStorage, đảm bảo backend sẽ nhận token này để xác thực
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/courses/enroll/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    })
      .then((res) => {
        if (res.ok) {
          alert('Đăng ký khóa học thành công');
          navigate('/my-courses');
        } else {
          res.text().then((text) => alert(`Đăng ký khóa học thất bại: ${text}`));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error enrolling in course:', error);
        alert('Đăng ký khóa học thất bại');
        setLoading(false);
      });
  };

  if (!courseDetail) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="course-detail">
      <div className="course-header">
        <h1 className="course-title">{courseDetail.title}</h1>
        <div className="course-meta">
          <p><strong>Giảng viên:</strong> {courseDetail.instructor}</p>
          <p><strong>Thời lượng:</strong> {courseDetail.duration}</p>
          <p><strong>Cấp độ:</strong> {courseDetail.level}</p>
          <p><strong>Số học viên:</strong> {courseDetail.studentsCount} học viên</p>
        </div>
        <div className="course-actions">
          <button 
            className="cta-button" 
            onClick={enrollCourse}
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
          </button>
          <button className="favorite-button">Thêm vào yêu thích</button>
        </div>
      </div>
      <p className="course-description">{courseDetail.description}</p>
      {courseDetail.category && (
        <p className="course-category">Chuyên mục: {courseDetail.category}</p>
      )}
      {courseDetail.videoUrl && (
        <div className="video-container">
          <iframe
            width="100%"
            height="500"
            src={getYoutubeEmbedUrl(courseDetail.videoUrl)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          ></iframe>
        </div>
      )}
      <div className="course-details">
        <h2>Nội dung khóa học</h2>
        <ul className="course-content">
          <li>Kiến thức cơ bản về {courseDetail.title}</li>
          <li>Thực hành thực tế với dự án mẫu</li>
          <li>Hỗ trợ 24/7 từ giảng viên</li>
          <li>Chứng chỉ hoàn thành (nếu có)</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseDetail;