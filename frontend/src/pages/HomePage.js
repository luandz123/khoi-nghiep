// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent, 
  CardActions, Button, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axiosInstance.get('/categories');
        if (categoriesResponse.data && categoriesResponse.data.length > 0) {
          setCategories(categoriesResponse.data);
          setActiveCategory(categoriesResponse.data[0].id);
        }
        
        // Fetch featured courses
        const coursesResponse = await axiosInstance.get('/courses/featured');
        setCourses(coursesResponse.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Set some mock data if the API fails
        setCategories([
          { id: 1, name: 'Lập trình Web' },
          { id: 2, name: 'Mobile App' },
          { id: 3, name: 'Frontend' },
          { id: 4, name: 'Backend' },
          { id: 5, name: 'Machine Learning' }
        ]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      fetchCoursesByCategory(activeCategory);
    }
  }, [activeCategory]);

  const fetchCoursesByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/courses/by-category/${categoryId}`);
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (category) => {
    setActiveCategory(category);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Function to extract YouTube thumbnail
  const getYoutubeThumbnail = (url) => {
    try {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } catch (error) {
      return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h1" className="hero-title">
              Học <span className="text-gradient">lập trình</span> để đi làm
            </Typography>
            <Typography variant="h5" className="hero-subtitle">
              Khám phá các khóa học chất lượng cao được thiết kế bởi các chuyên gia hàng đầu
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              className="hero-button"
              onClick={() => navigate('/courses')}
            >
              Xem khóa học
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* Featured Courses Section */}
      <section>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" className="section-title">
              Khóa học nổi bật
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Những khóa học được đánh giá cao và yêu thích nhất
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={4}>
                {courses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <motion.div variants={itemVariants}>
                      <Card className="course-card">
                        <CardMedia
                          component="img"
                          height="200"
                          image={course.thumbnail || (course.videoUrl ? getYoutubeThumbnail(course.videoUrl) : 'https://via.placeholder.com/640x360.png')}
                          alt={course.title}
                        />
                        <CardContent>
                          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {course.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                            mb: 2
                          }}>
                            {course.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon sx={{ fontSize: '0.9rem', color: 'primary.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {course.instructor || 'Giảng viên chưa cập nhật'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SchoolIcon sx={{ fontSize: '0.9rem', color: 'primary.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {course.studentsCount || 0} học viên
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ fontSize: '0.9rem', color: 'warning.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {course.rating || '4.8'} ({course.ratingCount || '24' } đánh giá)
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            fullWidth
                            variant="contained"
                            onClick={() => navigate(`/courses/${course.id}`)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: '8px'
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/courses')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Xem tất cả khóa học
            </Button>
          </Box>
        </Container>
      </section>

      {/* Categories Section */}
      <section>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" className="section-title">
              Danh mục khóa học
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Khám phá các khóa học theo danh mục bạn quan tâm
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs
              value={activeCategory}
              onChange={(e, newValue) => handleTabChange(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {categories.map(category => (
                <Tab
                  key={category.id}
                  label={category.name}
                  value={category.id}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: 100
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={4}>
                {courses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <motion.div variants={itemVariants}>
                      <Card className="course-card">
                        <CardMedia
                          component="img"
                          height="200"
                          image={course.thumbnail || (course.videoUrl ? getYoutubeThumbnail(course.videoUrl) : 'https://via.placeholder.com/640x360.png')}
                          alt={course.title}
                        />
                        <CardContent>
                          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {course.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                            mb: 2
                          }}>
                            {course.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon sx={{ fontSize: '0.9rem', color: 'primary.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {course.instructor || 'Giảng viên chưa cập nhật'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <SchoolIcon sx={{ fontSize: '0.9rem', color: 'primary.main', mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {course.studentsCount || 0} học viên
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            fullWidth
                            variant="contained"
                            onClick={() => navigate(`/courses/${course.id}`)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: '8px'
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default HomePage;