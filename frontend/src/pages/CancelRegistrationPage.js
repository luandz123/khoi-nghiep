import React, { useEffect, useState } from 'react';
import './CancelRegistrationPage.css';

const CancelRegistrationPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState('');

  // For demo, we'll assume userId is 1.
  const userId = 1;

  useEffect(() => {
    fetch('http://localhost:8080/api/user/info', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => res.json())
      .then((data) => setUserInfo(data))
      .catch((error) => console.error('Error fetching user info:', error));
  }, []);

  const cancelRegistration = (courseId) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đăng ký khóa học này?');
    if (!confirmCancel) return;

    const requestBody = { userId, courseId };

    fetch('http://localhost:8080/api/registrations/cancel', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}` // adjust as needed
      },
      body: JSON.stringify(requestBody)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "Success") {
          setMessage(data.message);
          // Remove the canceled course from the list
          setUserInfo((prev) => ({
            ...prev,
            enrolledCourses: prev.enrolledCourses.filter(course => course.courseId !== courseId)
          }));
        } else {
          setMessage(data.message);
        }
      })
      .catch((error) => {
        console.error('Error canceling registration:', error);
        setMessage('Hủy đăng ký thất bại');
      });
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="cancel-page">
      <h1>Khóa học đã đăng ký</h1>
      {message && <p className="message">{message}</p>}
      <div className="courses-list">
        {userInfo.enrolledCourses && userInfo.enrolledCourses.length > 0 ? (
          userInfo.enrolledCourses.map((course) => (
            <div key={course.courseId} className="course-item">
              <div className="course-details">
                <div className="course-title">{course.title}</div>
              </div>
              <button className="cancel-button" onClick={() => cancelRegistration(course.courseId)}>
                Hủy
              </button>
            </div>
          ))
        ) : (
          <p>Bạn chưa đăng ký khóa học nào.</p>
        )}
      </div>
    </div>
  );
};

export default CancelRegistrationPage;