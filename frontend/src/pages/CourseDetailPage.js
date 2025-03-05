import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [courseDetail, setCourseDetail] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/courses/${id}/detail`)
      .then(response => response.json())
      .then(data => setCourseDetail(data))
      .catch(error => console.error('Error fetching course details:', error));
  }, [id]);

  if (!courseDetail) {
    return <div className="loading">Đang tải...</div>;
  }

  // Hàm chuyển đổi link YouTube sang dạng embed
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

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <h1 className="course-title">{courseDetail.title}</h1>
        <div className="course-meta">
          <p><strong>Giảng viên:</strong> {courseDetail.instructor || 'Không có thông tin'}</p>
          <p><strong>Thời lượng:</strong> {courseDetail.duration || 'Chưa cập nhật'}</p>
          <p><strong>Cấp độ:</strong> {courseDetail.level || 'Tất cả cấp độ'}</p>
          <p><strong>Số học viên:</strong> {courseDetail.studentsCount || '0'} học viên</p>
        </div>
        <div className="course-actions">
          <button className="cta-button">Đăng ký ngay</button>
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

export default CourseDetailPage;