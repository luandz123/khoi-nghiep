import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import './HomePage.css';
import { Box, Container, Grid, Typography, Button, Card, CardMedia, CardContent, Chip, Rating, TextField, CircularProgress } from '@mui/material';
// Thêm import framer-motion
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LaptopIcon from '@mui/icons-material/Laptop';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Xóa dấu chấm phẩy thừa

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(''); // Không sử dụng biến error nên đổi thành setError
  const [activeCategory, setActiveCategory] = useState(null);

  // Lấy danh mục và các sản phẩm nổi bật khi component mount
  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  // Khi activeCategory thay đổi, gọi API lấy khóa học theo danh mục
  useEffect(() => {
    if (activeCategory) {
      fetchCoursesByCategory(activeCategory.id);
    }
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      const catData = Array.isArray(response.data) ? response.data : [];
      setCategories(catData);
      // Chọn danh mục đầu tiên làm active mặc định nếu có
      if (catData.length > 0) {
        setActiveCategory(catData[0]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Lấy 4 sản phẩm nổi bật để hiển thị
  const fetchFeaturedProducts = async () => {
    try {
      const response = await axiosInstance.get('/products', {
        params: { size: 4, sort: 'createdAt,desc' }
      });
      setProducts(response.data.content || []);
    } catch (err) {
      console.error("Error fetching featured products:", err);
    }
  };

  // Hàm lấy khóa học theo danh mục
  const fetchCoursesByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/courses/by-category/${categoryId}`);
      const retrievedCourses = Array.isArray(response.data) ? response.data : [];
      // Thêm thuộc tính thời lượng khóa học giả định (10-40 giờ) nếu cần
      const coursesWithDuration = retrievedCourses.map(course => ({
        ...course,
        duration: `${Math.floor(Math.random() * 30) + 10} giờ`,
        // Thêm rating giả để demo
        rating: (Math.random() * 2 + 3).toFixed(1)
      }));
      setCourses(coursesWithDuration);
      // setError('');
    } catch (err) {
      console.error("Error fetching courses:", err);
      // setError('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (category) => {
    setActiveCategory(category);
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
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

  return (
    <div className="homepage">
      {/* Hero Section - Modern & Animated */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hero-content"
              >
                <Typography variant="overline" className="hero-badge">
                  Nền tảng học tập #1 Việt Nam
                </Typography>
                <Typography variant="h2" component="h1" className="hero-title">
                  Phát triển kỹ năng lập trình <span className="text-gradient">không giới hạn</span>
                </Typography>
                <Typography variant="body1" className="hero-subtitle">
                  Khám phá hơn 1000+ khóa học từ cơ bản đến nâng cao. Học từ các chuyên gia hàng đầu trong ngành công nghệ.
                </Typography>
                <Box className="hero-cta-group">
                  <Button 
                    variant="contained" 
                    size="large" 
                    className="cta-button primary"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Học miễn phí ngay
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    className="cta-button secondary"
                  >
                    Khám phá khóa học
                  </Button>
                </Box>
                
                <Box className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-number">20K+</span>
                    <span className="stat-label">Học viên</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Khóa học</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">100%</span>
                    <span className="stat-label">Hài lòng</span>
                  </div>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hero-image-container"
              >
                <img 
                  src="https://img.freepik.com/free-vector/programming-concept-illustration_114360-1351.jpg" 
                  alt="Học lập trình" 
                  className="hero-image" 
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
        
        {/* Wave separator */}
        
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container maxWidth="lg">
          <Box className="section-header" textAlign="center" mb={6}>
            <Typography variant="h4" component="h2" className="section-title">
              Tại sao chọn chúng tôi?
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Nền tảng học tập trực tuyến với nhiều ưu điểm vượt trội
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <LaptopIcon fontSize="large" />
                </div>
                <Typography variant="h6" className="feature-title">Học mọi lúc mọi nơi</Typography>
                <Typography variant="body2">Truy cập khóa học từ mọi thiết bị, mọi thời điểm mà bạn mong muốn</Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <WorkIcon fontSize="large" />
                </div>
                <Typography variant="h6" className="feature-title">Dự án thực tế</Typography>
                <Typography variant="body2">Xây dựng portfolio ấn tượng với các dự án thực tế từ các khóa học</Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <SchoolIcon fontSize="large" />
                </div>
                <Typography variant="h6" className="feature-title">Giảng viên chất lượng</Typography>
                <Typography variant="body2">Đội ngũ giảng viên giàu kinh nghiệm từ các công ty công nghệ hàng đầu</Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <ShoppingCartIcon fontSize="large" />
                </div>
                <Typography variant="h6" className="feature-title">Mua sắm phụ kiện</Typography>
                <Typography variant="body2">Cung cấp đầy đủ các phụ kiện, sách và công cụ hỗ trợ việc học tập</Typography>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Categories Tabs Section */}
      <section className="categories-section">
        <Container maxWidth="lg">
          <Box className="section-header" textAlign="center" mb={3}>
            <Typography variant="h4" component="h2" className="section-title">
              Khóa học theo danh mục
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Chọn lĩnh vực bạn muốn phát triển kỹ năng
            </Typography>
          </Box>
          
          <Box className="category-tabs">
            {categories.map(cat => (
              <Button
                key={cat.id}
                className={`category-tab ${activeCategory && activeCategory.id === cat.id ? 'active' : ''}`}
                onClick={() => handleTabChange(cat)}
                variant={activeCategory && activeCategory.id === cat.id ? "contained" : "outlined"}
              >
                {cat.name}
              </Button>
            ))}
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3} className="courses-grid">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <motion.div variants={itemVariants}>
                        <Card className="course-card">
                          <Box className="course-badge">
                            <Chip 
                              label={activeCategory?.name || "Khóa học"} 
                              size="small"
                              color="primary"
                            />
                          </Box>
                          <CardMedia
                            component="img"
                            image={course.image || `https://source.unsplash.com/500x300/?coding,${course.title}`}
                            alt={course.title}
                            className="course-image"
                          />
                          <CardContent>
                            <Typography variant="h6" className="course-title">
                              {course.title}
                            </Typography>
                            <Box className="course-meta">
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <PersonIcon fontSize="small" />
                                <Typography variant="body2">{course.instructor}</Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <AccessTimeIcon fontSize="small" />
                                <Typography variant="body2">{course.duration}</Typography>
                              </Box>
                            </Box>
                            <Box className="course-rating" display="flex" alignItems="center" mt={1}>
                              <Rating 
                                value={parseFloat(course.rating) || 4.5} 
                                readOnly 
                                size="small"
                                precision={0.5}
                              />
                              <Typography variant="body2" ml={1}>
                                ({course.rating})
                              </Typography>
                            </Box>
                          </CardContent>
                          <Box className="course-action">
                            <Link to={`/courses/${course.id}`} className="course-link">
                              <Button 
                                variant="contained" 
                                fullWidth
                                endIcon={<ArrowForwardIcon />}
                              >
                                Chi tiết
                              </Button>
                            </Link>
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box textAlign="center" py={4}>
                      <Typography>Không có khóa học nào cho danh mục này</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          )}
        </Container>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <Container maxWidth="lg">
          <Box className="section-header" textAlign="center" mb={6}>
            <Typography variant="h4" component="h2" className="section-title">
              Sản phẩm nổi bật
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Trang bị đầy đủ công cụ để học tập hiệu quả
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {products.map((product, index) => (
              <Grid item xs={12} sm={6} md={3} key={product.id || index}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  className="product-card"
                >
                  <img 
                    src={product.imageUrl || "https://via.placeholder.com/300x300?text=Product"} 
                    alt={product.name} 
                    className="product-image"
                  />
                  <Box className="product-info">
                    <Typography variant="h6" className="product-name">{product.name}</Typography>
                    <Typography variant="body2" className="product-category">{product.category}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="h6" className="product-price">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </Typography>
                      <Link to={`/products/${product.id}`}>
                        <Button variant="outlined" size="small">Xem chi tiết</Button>
                      </Link>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
          <Box textAlign="center" mt={4}>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/products"
              endIcon={<ArrowForwardIcon />}
              className="view-all-button"
            >
              Xem tất cả sản phẩm
            </Button>
          </Box>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <Container maxWidth="md">
          <Box className="section-header" textAlign="center" mb={6}>
            <Typography variant="h4" component="h2" className="section-title">
              Học viên nói gì về chúng tôi
            </Typography>
            <Typography variant="body1" className="section-subtitle">
              Khám phá trải nghiệm học tập từ các học viên
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {[
              {
                name: "Nguyễn Văn A",
                role: "Front-end Developer",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                content: "Tôi đã học được rất nhiều kiến thức bổ ích từ các khóa học. Giảng viên rất nhiệt tình và giảng dạy dễ hiểu."
              },
              {
                name: "Trần Thị B",
                role: "UI/UX Designer",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                content: "Các bài giảng được thiết kế rất khoa học và có nhiều bài tập thực hành. Tôi đã tìm được việc làm ngay sau khi hoàn thành khóa học."
              },
              {
                name: "Lê Văn C",
                role: "Mobile Developer",
                image: "https://randomuser.me/api/portraits/men/67.jpg",
                content: "Nội dung khóa học luôn được cập nhật theo xu hướng mới nhất. Các kỹ năng học được đều áp dụng được vào thực tế công việc."
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="testimonial-card"
                >
                  <Box className="testimonial-content">
                    <Typography variant="body1">&ldquo;{testimonial.content}&rdquo;</Typography>
                  </Box>
                  <Box className="testimonial-author" display="flex" alignItems="center">
                    <img src={testimonial.image} alt={testimonial.name} className="testimonial-avatar" />
                    <Box ml={2}>
                      <Typography variant="subtitle1" fontWeight="bold">{testimonial.name}</Typography>
                      <Typography variant="body2">{testimonial.role}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center" className="newsletter-container">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                Nhận thông tin khóa học mới
              </Typography>
              <Typography variant="body1">
                Đăng ký nhận thông báo về các khóa học mới và ưu đãi đặc biệt
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" className="newsletter-form">
                <TextField
                  variant="outlined"
                  placeholder="Email của bạn"
                  fullWidth
                  size="small"
                />
                <Button variant="contained" className="newsletter-button">
                  Đăng ký
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;