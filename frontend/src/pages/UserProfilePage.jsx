import React, { useEffect, useState } from 'react';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/user/info', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // adjust as needed
      }
    })
      .then((res) => res.json())
      .then((data) => setUserInfo(data))
      .catch((error) => console.error('Error fetching user info:', error));
  }, []);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="user-info-card">
        <img src={userInfo.avatar} alt="User Avatar" className="user-avatar" />
        <div className="user-details">
          <div className="detail-item"><strong>Name: </strong>{userInfo.name}</div>
          <div className="detail-item"><strong>Email: </strong>{userInfo.email}</div>
        </div>
      </div>
      <h2>Khóa học đã đăng ký</h2>
      <div className="courses-grid">
        {userInfo.enrolledCourses.map((course) => (
          <div key={course.courseId} className="course-card">
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
            )}
            <div className="course-title">{course.title}</div>
            <button className="continue-button">Tiếp tục học</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfilePage;