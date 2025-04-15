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
          {/* Admin Routes */}
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
            <Route path="users" element={<AdminUserList />} />
            <Route path="courses" element={<AdminCourseList />} />
            <Route path="add-course" element={<AdminAddCoursePage />} />
            <Route path="manage-courses" element={<AdminCourseManagementPage />} />
            <Route path="chapters/:courseId" element={<AdminChapterList />} />
            <Route path="lessons/:chapterId" element={<AdminLessonList />} />
            <Route path="categories" element={<AdminCategoryPage />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="orders" element={<AdminOrderList />} />
            {/* Add other admin routes here */}
          </Route>

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              {/* Adjust main content container style as needed */}
              <div className="main-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)', marginTop: '70px' }}>
                <div className="main-content" style={{ flex: 1, padding: '20px' }}> {/* Ensure content takes available space */}
                  <Routes>
                    {/* Core Pages */}
                    <Route path="/" element={<HomePage />} />
                    {/* Special Course Views - These routes pass props to CoursesPage */}
                    {/* CoursesPage should use these props to set initial query parameters */}
                    <Route path="/featured-courses" element={<CoursesPage featuredFilter={true} />} />
                    <Route path="/new-courses" element={<CoursesPage sortByNewest={true} />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/courses/:id" element={<CourseDetailPage />} />

                    

                    {/* Other Public Pages */}
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:category" element={<ProductsPage />} /> {/* Handle category filtering in ProductsPage */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/services" element={<ServicesPage />} />

                    {/* Auth Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cancel-registration" element={<CancelRegistrationPage />} />

                    {/* Protected User Pages */}
                    <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
                    <Route path="/courses/:courseId/learn/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                    <Route path="/profile/update" element={<ProtectedRoute><UserProfileUpdatePage /></ProtectedRoute>} />

                    {/* Add a 404 or catch-all route if needed */}
                    {/* <Route path="*" element={<NotFoundPage />} /> */}
                  </Routes>
                </div>
                <Footer /> {/* Footer outside the inner Routes, but inside the main layout */}
              </div>
            </>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;