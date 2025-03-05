// filepath: /c:/Users/lenovo/OneDrive/Desktop/demo/frontend/src/components/admin/AdminCourseManagementPage.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import './AdminCourseManagementPage.css';

const AdminCourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]); // Thêm state để lưu danh sách danh mục

  useEffect(() => {
    // Lấy danh sách khóa học
    const fetchCourses = async () => {
      try {
        const coursesResponse = await axiosInstance.get('/api/admin/courses');
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error('Lỗi khi tải khóa học:', error);
        setError('Không thể tải danh sách khóa học');
      }
    };

    // Lấy danh sách danh mục
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await axiosInstance.get('/categories');
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        setError('Không thể tải danh sách danh mục');
      }
    };

    fetchCourses();
    fetchCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  const handleEdit = (courseId) => {
    console.log('Chỉnh sửa khóa học ID:', courseId);
    // Có thể thêm điều hướng sang trang chỉnh sửa, ví dụ: history.push(`/admin/courses/edit/${courseId}`);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;

    try {
      await axiosInstance.delete(`/api/admin/courses/${courseId}`);
      setCourses(courses.filter(course => course.id !== courseId));
      alert('Xóa khóa học thành công');
    } catch (error) {
      console.error('Lỗi khi xóa khóa học:', error);
      alert('Lỗi khi xóa khóa học: ' + (error.response?.data?.message || error.message));
    }
  };

  if (error) {
    return (
      <div className="admin-course-management-page">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-course-management-page">
      <h1>Quản Lý Khóa Học</h1>
      {courses.length === 0 ? (
        <p>Chưa có khóa học nào.</p>
      ) : (
        <table className="course-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Mô tả</th>
              <th>Thumbnail</th>
              <th>Danh mục</th>
              <th>Video URL</th> {/* Thêm cột Video URL */}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
                  ) : (
                    'Không có hình'
                  )}
                </td>
                <td>{getCategoryName(course.categoryId)}</td> {/* Sử dụng categoryId thay vì category */}
                <td>
                  {course.videoUrl ? (
                    <a href={course.videoUrl} target="_blank" rel="noopener noreferrer">Xem video</a>
                  ) : (
                    'Không có video'
                  )}
                </td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(course.id)}>Sửa</button>
                  <button className="delete-button" onClick={() => handleDelete(course.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCourseManagementPage;