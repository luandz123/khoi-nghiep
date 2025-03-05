import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// Layout Components
import Navbar from './components/navbar/Navbar';
import Sidebar from './components/sidebar/Sidebar';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import ProductsPage from './pages/ProductsPage';
import UserProfilePage from './pages/UserProfilePage';

// Course Components
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail';
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
import AdminProductList from './components/admin/AdminProductList';
import AdminOrderList from './components/admin/AdminOrderList';
import AdminCategoryPage from './components/admin/AdminCategoryPage';

function App() {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const toggleSidebar = () => setSidebarExpanded(prev => !prev);

  return (
    <>
      <CssBaseline />
      <Router>
        <Navbar />
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          toggleSidebar={toggleSidebar} 
        />
        <div 
          className="main-content" 
          style={{ 
            marginLeft: isSidebarExpanded ? '250px' : '60px', 
            marginTop: '60px',
            transition: 'margin-left 0.3s ease',
            padding: '20px'
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/my-courses" element={<MyCourses />} />
            
            {/* Protected User Route */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
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
              <Route path="products" element={<AdminProductList />} />
              <Route path="orders" element={<AdminOrderList />} />
              <Route path="categories" element={<AdminCategoryPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;