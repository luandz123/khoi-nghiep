import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent,
  CardActions, Button, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import './HomePage.css';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [newCourses, setNewCourses] = useState([]);
  const [categoryCourses, setCategoryCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [newCoursesLoading, setNewCoursesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = 3;

  // Hàm để lấy thumbnail từ YouTube URL
  const getYoutubeThumbnail = (url) => {
    if (!url) return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';

    try {
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return 'https://via.placeholder.com/640x360.png?text=Invalid+YouTube+URL';
    } catch (error) {
      console.error('Error extracting YouTube thumbnail:', error);
      return 'https://via.placeholder.com/640x360.png?text=Error+Loading+Thumbnail';
    }
  };

  // Effect cho việc tự động chuyển đổi slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Effect để khởi tạo và tải dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchFeaturedCourses(),
        fetchNewCourses(),
        fetchCategories()
      ]);
    };
    fetchInitialData();
  }, []);

  // Tách riêng việc fetch danh mục
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      if (Array.isArray(response.data)) {
        const validCategories = response.data.filter(category => category && category.id);
        setCategories(validCategories);
        if (validCategories.length > 0) {
          setActiveCategory(validCategories[0].id);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

    // ...existing code...
  
    // Tách riêng việc fetch khóa học nổi bật - Sử dụng API mới
    const fetchFeaturedCourses = async () => {
      setFeaturedLoading(true);
      try {
        // Sử dụng API endpoint mới từ SpecialCourseController
        const response = await axiosInstance.get('/featured-courses'); // API Chính xác
        console.log('Featured courses from API:', response.data);
  
        if (Array.isArray(response.data)) {
          const validCourses = response.data.filter(course => course && course.id);
          setFeaturedCourses(validCourses);
          console.log('Valid featured courses:', validCourses);
        } else {
          setFeaturedCourses([]);
        }
      } catch (error) {
        console.error('Error fetching featured courses (primary API /featured-courses):', error);
        // Fallback 2: Lấy tất cả và lọc (Loại bỏ fallback 1 gọi /courses/featured)
        try {
          console.log('Attempting fallback: /courses with filter');
          const allCoursesResponse = await axiosInstance.get('/courses');
          if (Array.isArray(allCoursesResponse.data)) {
            const featured = allCoursesResponse.data.filter(course => course && course.id && course.featured === true);
            setFeaturedCourses(featured);
            console.log('Featured courses from fallback:', featured);
          } else {
            setFeaturedCourses([]);
          }
        } catch (fallbackError) {
          console.error('Fallback error (/courses):', fallbackError);
          setFeaturedCourses([]);
        }
      } finally {
        setFeaturedLoading(false);
      }
    };
  
    // Tách riêng việc fetch khóa học mới - Sử dụng API mới
    const fetchNewCourses = async () => {
      setNewCoursesLoading(true);
      try {
        // Sử dụng API endpoint mới từ SpecialCourseController
        const response = await axiosInstance.get('/new-courses', { // API Chính xác
          params: { limit: 3 }
        });
        console.log('New courses from API:', response.data);
  
        if (Array.isArray(response.data)) {
          const validCourses = response.data.filter(course => course && course.id);
          setNewCourses(validCourses);
          console.log('Valid new courses:', validCourses);
        } else {
           throw new Error('Primary API /new-courses failed or returned invalid data'); // Trigger fallback
        }
      } catch (error) {
        console.error('Error fetching new courses (primary API /new-courses):', error);
        // Fallback 2: Lấy tất cả và sắp xếp (Loại bỏ fallback 1 gọi /courses/new)
        try {
          console.log('Attempting fallback: /courses with sort');
          const allCoursesResponse = await axiosInstance.get('/courses');
          if (Array.isArray(allCoursesResponse.data)) {
            const sorted = [...allCoursesResponse.data]
              .filter(course => course && course.id)
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : null;
                const dateB = b.createdAt ? new Date(b.createdAt) : null;
                if (dateA && dateB) return dateB - dateA;
                if (dateA) return -1;
                if (dateB) return 1;
                return b.id - a.id;
              });
            setNewCourses(sorted.slice(0, 3));
            console.log('New courses from fallback:', sorted.slice(0, 3));
          } else {
            setNewCourses([]);
          }
        } catch (fallbackError) {
          console.error('Fallback error (/courses):', fallbackError);
          setNewCourses([]);
        }
      } finally {
        setNewCoursesLoading(false);
      }
    };
  
  // ...existing code...


  // Fetch courses when active category changes
  useEffect(() => {
    if (activeCategory !== null) { // Check for null explicitly
      fetchCoursesByCategory(activeCategory);
    }
  }, [activeCategory]);

  // Fetch courses by category ID
  const fetchCoursesByCategory = async (categoryId) => {
    setLoading(true);
    try {
      // Use the general /courses endpoint with category parameter
      const response = await axiosInstance.get(`/courses`, {
        params: { category: categoryId }
      });
      if (Array.isArray(response.data)) {
        setCategoryCourses(response.data.filter(course => course && course.id) || []);
      } else {
        // Fallback: Try the old endpoint if the primary fails or returns non-array
        try {
          const fallbackResponse = await axiosInstance.get(`/courses/by-category/${categoryId}`);
          if (Array.isArray(fallbackResponse.data)) {
            setCategoryCourses(fallbackResponse.data.filter(course => course && course.id) || []);
          } else {
            setCategoryCourses([]);
          }
        } catch (fallbackError) {
          console.error('Fallback error fetching courses by category:', fallbackError);
          setCategoryCourses([]);
        }
      }
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      setCategoryCourses([]);
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (event, newValue) => {
    setActiveCategory(newValue);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  // Get thumbnail URL logic
  const getThumbnailUrl = (course) => {
    if (!course) return 'https://via.placeholder.com/640x360.png?text=No+Course+Data';
    if (course.videoUrl) return getYoutubeThumbnail(course.videoUrl);
    if (!course.thumbnail) return 'https://via.placeholder.com/640x360.png?text=No+Image';
    if (course.thumbnail.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${course.thumbnail}`;
    }
    return course.thumbnail;
  };

  // Reusable CourseCard component
  const CourseCard = ({ course }) => {
    if (!course || !course.id) {
      console.error('Invalid course data passed to CourseCard:', course);
      return null; // Don't render if course data is invalid
    }

    return (
      <Card className="course-card">
        <CardMedia
          component="img"
          height="200"
          image={getThumbnailUrl(course)}
          alt={course.title || "Khóa học"}
          onError={(e) => {
            console.warn(`Image load failed for course: ${course.title || course.id}. URL: ${e.target.src}`);
            e.target.onerror = null; // Prevent infinite loop if fallback also fails
            e.target.src = 'https://via.placeholder.com/640x360.png?text=Image+Error';
          }}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.05)' }
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}> {/* Ensure content pushes actions down */}
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', minHeight: '3em', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
            {course.title || "Khóa học chưa có tên"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', mb: 2, minHeight: '2.5em' }}>
            {course.description || "Chưa có mô tả"}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {course.instructor || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SchoolIcon sx={{ fontSize: '0.9rem', color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {course.studentsCount || 0} học viên
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ fontSize: '0.9rem', color: 'warning.main', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {course.rating ? `${course.rating.toFixed(1)} (${course.ratingCount || 0})` : 'Chưa có đánh giá'}
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', p: 2 }}> {/* Center button */}
          <Button
            size="small"
            fullWidth
            variant="contained"
            onClick={() => navigate(`/courses/${course.id}`)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
          >
            Xem chi tiết
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Render function
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container className="hero-content">
          <motion.div
            key={activeSlide} // Re-trigger animation on slide change
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="banner-content"
          >
            {/* Slide content based on activeSlide */}
            {activeSlide === 0 && (
              <>
                <Typography variant="h1" className="hero-title">Học <span className="text-gradient">IT</span> miễn phí</Typography>
                <Typography variant="h5" className="hero-subtitle">Khóa học miễn phí cho sinh viên IT - Bắt đầu sự nghiệp ngay hôm nay</Typography>
                <Button variant="contained" size="large" className="hero-button" onClick={() => navigate('/courses')}>Khóa học miễn phí</Button>
              </>
            )}
            {activeSlide === 1 && (
              <>
                <Typography variant="h1" className="hero-title"><span className="text-gradient">Bài tập</span> phù hợp</Typography>
                <Typography variant="h5" className="hero-subtitle">Luyện tập với các bài tập sát với nội dung học, giúp bạn nắm vững kiến thức</Typography>
                <Button variant="contained" size="large" className="hero-button" onClick={() => navigate('/courses')}>Trải nghiệm ngay</Button>
              </>
            )}
            {activeSlide === 2 && (
              <>
                <Typography variant="h1" className="hero-title"><span className="text-gradient">Source code</span> uy tín</Typography>
                <Typography variant="h5" className="hero-subtitle">Đồ án tốt nghiệp, trang web bán hàng nhỏ, cài và chạy ngay</Typography>
                <Button variant="contained" size="large" className="hero-button" onClick={() => navigate('/products')}>Khám phá ngay</Button>
              </>
            )}
          </motion.div>
        </Container>
      </section>

      {/* New Courses Section */}
      <section>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" className="section-title">
              <NewReleasesIcon sx={{ mr: 1, verticalAlign: 'bottom', color: 'primary.main' }} />
              Khóa học mới
            </Typography>
            <Typography variant="body1" className="section-subtitle">Những khóa học mới nhất vừa được cập nhật</Typography>
          </Box>
          {newCoursesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
          ) : newCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}><Typography variant="body1">Chưa có khóa học mới.</Typography></Box>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={4}>
                {newCourses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={`new-${course.id}`}>
                    <motion.div variants={itemVariants}><CourseCard course={course} /></motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {/* Updated Button Navigation to use dedicated route */}
            <Button variant="outlined" size="large" onClick={() => navigate('/new-courses')} sx={{ px: 4, py: 1.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
              Xem tất cả khóa học mới
            </Button>
          </Box>
        </Container>
      </section>

      {/* Featured Courses Section */}
      <section>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" className="section-title">
              <StarIcon sx={{ mr: 1, verticalAlign: 'bottom', color: 'warning.main' }} />
              Khóa học nổi bật
            </Typography>
            <Typography variant="body1" className="section-subtitle">Những khóa học được đánh giá cao và yêu thích nhất</Typography>
          </Box>
          {featuredLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
          ) : featuredCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}><Typography variant="body1">Chưa có khóa học nổi bật.</Typography></Box>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={4}>
                {featuredCourses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={`featured-${course.id}`}>
                    <motion.div variants={itemVariants}><CourseCard course={course} /></motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
             {/* Updated Button Navigation to use dedicated route */}
            <Button variant="outlined" size="large" onClick={() => navigate('/featured-courses')} sx={{ px: 4, py: 1.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
              Xem tất cả khóa học nổi bật
            </Button>
          </Box>
        </Container>
      </section>

      {/* Categories Section */}
      <section>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" className="section-title">Danh mục khóa học</Typography>
            <Typography variant="body1" className="section-subtitle">Khám phá các khóa học theo danh mục bạn quan tâm</Typography>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs value={activeCategory} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="Course categories">
              {categories.map(category => (
                <Tab key={category.id} label={category.name} value={category.id} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '1rem', minWidth: 100 }} />
              ))}
            </Tabs>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
          ) : categoryCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}><Typography variant="body1">Chưa có khóa học trong danh mục này.</Typography></Box>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid container spacing={4}>
                {categoryCourses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={`cat-${course.id}`}>
                    <motion.div variants={itemVariants}><CourseCard course={course} /></motion.div>
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