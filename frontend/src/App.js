import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// Layout Components
import Navbar from './components/navbar/Navbar';

import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPage from './pages/LessonPage';
import NewsPage from './pages/NewsPage';
import ProductsPage from './pages/ProductsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import RegistrationPage from './pages/RegistrationPage';
import CancelRegistrationPage from './pages/CancelRegistrationPage';
import UserProfilePage from './pages/UserProfilePage';
import UserProfileUpdatePage from './pages/UserProfileUpdatePage';

// Course Components
import MyCourses from './components/mycourses/MyCourses';

// Auth Components
import Login from './components/Login';
import Register from './components/Register';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUserList from './components/admin/AdminUserList';
import AdminCourseList from './components/admin/AdminCourseList';
import AdminAddCoursePage from './components/admin/AdminAddCoursePage';
import AdminCourseManagementPage from './components/admin/AdminCourseManagementPage';
import AdminChapterList from './components/admin/AdminChapterList';
import AdminLessonList from './components/admin/AdminLessonList';
import AdminProductList from './components/admin/AdminProductList';
import AdminOrderList from './components/admin/AdminOrderList';
import AdminCategoryPage from './components/admin/AdminCategoryPage';

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Admin Routes - Using AdminLayout */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Quản lý người dùng */}
            <Route path="users" element={<AdminUserList />} />
            
            {/* Quản lý khóa học */}
            <Route path="courses" element={<AdminCourseList />} />
            <Route path="add-course" element={<AdminAddCoursePage />} />
            <Route path="manage-courses" element={<AdminCourseManagementPage />} />
            <Route path="chapters/:courseId" element={<AdminChapterList />} />
            <Route path="lessons/:chapterId" element={<AdminLessonList />} />
            
            {/* Quản lý danh mục */}
            <Route path="categories" element={<AdminCategoryPage />} />
            
            {/* Quản lý sản phẩm */}
            <Route path="products" element={<AdminProductList />} />
            
            {/* Quản lý đơn hàng */}
            <Route path="orders" element={<AdminOrderList />} />
          </Route>

          {/* Public Routes with Navbar and Footer */}
          <Route path="/*" element={
            <>
              <Navbar />
              <div className="main-container" style={{ display: 'flex' }}>
               
                <div className="main-content" style={{ flex: 1, marginTop: '70px', padding: '20px' }}>
                  <Routes>
                    {/* Trang chính */}
                    <Route path="/" element={<HomePage />} />
                    
                    {/* Các trang liên quan đến khóa học */}
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/:id" element={<CourseDetailPage />} />
                    
                    {/* Các trang khác */}
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:category" element={<ProductsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    
                    {/* Trang xác thực */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/registration" element={<RegistrationPage />} />
                    <Route path="/cancel-registration" element={<CancelRegistrationPage />} />
                    
                    {/* Trang người dùng được bảo vệ */}
                    <Route path="/my-courses" element={
                      <ProtectedRoute>
                        <MyCourses />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/courses/:courseId/learn/:lessonId" element={
                      <ProtectedRoute>
                        <LessonPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <UserProfilePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile/update" element={
                      <ProtectedRoute>
                        <UserProfileUpdatePage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </div>
              </div>
              <Footer />
            </>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;