import React, { useState, useEffect } from 'react';
import './RegistrationPage.css';

const RegistrationPage = () => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

  const registerCourse = (courseId) => {
    // For demonstration purposes, we're using a fixed userId of 1
    const requestBody = { userId: 1, courseId };

    fetch('http://localhost:8080/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error('Registration error:', error);
        setMessage('Đăng ký lỗi');
      });
  };

  return (
    <div className="registration-page">
      <h1>Đăng ký khóa học</h1>
      {message && <p className="message">{message}</p>}
      <div className="courses-list">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <button
              className="register-button"
              onClick={() => registerCourse(course.id)}
            >
              Đăng ký
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegistrationPage;