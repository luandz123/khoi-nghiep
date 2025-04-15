import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Box, CircularProgress, LinearProgress, Chip, Alert // Added Alert
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon // Added ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosConfig';
import './MyCourses.css';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const fetchMyCourses = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch
      try {
        const response = await axiosInstance.get('/courses/my-courses');
        if (isMounted) {
          setCourses(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching my courses:', err);
        if (isMounted) {
          if (err.response?.status === 401) {
            // Unauthorized: Token might be invalid or expired.
            console.warn('Unauthorized access to /my-courses. Redirecting to login.');
            // Redirect to login, potentially passing a message
            navigate('/login', { state: { from: '/my-courses', message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' } });
          } else {
            // Handle other errors (e.g., network issues, server errors)
            setError(err.response?.data?.message || 'Không thể tải danh sách khóa học của bạn. Vui lòng thử lại sau.');
            setCourses([]); // Ensure courses are empty on error
          }
        }
      } finally {
        // Only update state if the component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyCourses();

    // Cleanup function to run when the component unmounts
    return () => {
      isMounted = false;
    };
  }, [navigate]); // Keep navigate in dependency array

  // Function to extract YouTube thumbnail
  const getYoutubeThumbnail = (url) => {
    if (!url) return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';
    
    try {
      const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
        
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      } else {
        // Attempt to extract ID from short URLs or other formats if needed
        const shortUrlMatch = url.split('/').pop();
        if (shortUrlMatch && shortUrlMatch.length === 11) {
           return `https://img.youtube.com/vi/${shortUrlMatch}/maxresdefault.jpg`;
        }
      }
      return 'https://via.placeholder.com/640x360.png?text=Invalid+URL'; // Indicate invalid URL if ID extraction fails
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return 'https://via.placeholder.com/640x360.png?text=Error'; // Indicate error
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display error message if a non-401 error occurred
  if (error) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" icon={<ErrorIcon fontSize="inherit" />} sx={{ mb: 3, justifyContent: 'center' }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Tải lại trang
        </Button>
      </Container>
    );
  }

  if (courses.length === 0) {
    return (
      <Container sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Bạn chưa đăng ký khóa học nào
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Khám phá các khóa học chất lượng cao và bắt đầu hành trình học tập của bạn!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Khám phá khóa học
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Khóa học của tôi
      </Typography>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id || Math.random()}> {/* Added fallback key */}
              <motion.div variants={itemVariants}>
                <Card className="my-course-card">
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={course.thumbnail || getYoutubeThumbnail(course.videoUrl)}
                      alt={course.title || 'Course thumbnail'}
                      className="course-thumbnail"
                      // Add error handling for the image itself
                      onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/640x360.png?text=Image+Load+Error'; }}
                    />
                    
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        p: 1,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip 
                          icon={<TimerIcon sx={{ fontSize: '0.75rem !important' }} />}
                          label={course.duration || 'N/A'}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.9)', 
                            color: 'text.primary',
                            fontSize: '0.7rem'
                          }}
                        />
                        
                        <Chip 
                          icon={(course.progress || 0) >= 100 
                            ? <CheckCircleIcon sx={{ fontSize: '0.75rem !important' }} />
                            : null
                          }
                          label={`${course.progress || 0}% hoàn thành`}
                          size="small"
                          color={(course.progress || 0) >= 100 ? 'success' : 'default'}
                          sx={{ 
                            bgcolor: (course.progress || 0) >= 100 
                              ? 'success.light' 
                              : 'rgba(255,255,255,0.9)', 
                            color: (course.progress || 0) >= 100 ? 'white' : 'text.primary',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 2 }}>
                    <Typography 
                      variant="subtitle1" 
                      component="h2" 
                      title={course.title || ''} // Add title attribute for full text on hover
                      sx={{ 
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.5em', // Adjust based on line height for 2 lines
                        lineHeight: '1.25em'
                      }}
                    >
                      {course.title || 'Không có tiêu đề'}
                    </Typography>
                    
                    <Box sx={{ mt: 1, mb: 1 }}> {/* Reduced margin top */}
                      <LinearProgress 
                        variant="determinate" 
                        value={course.progress || 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'grey.300', // Background for the progress bar track
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: (course.progress || 0) >= 100 ? 'success.main' : 'primary.main',
                          }
                        }} 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {typeof course.completedLessons === 'number' ? course.completedLessons : 0}/{typeof course.totalLessons === 'number' ? course.totalLessons : '?'} bài học
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.progress || 0}%
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PlayIcon />}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      disabled={!course.id} // Disable if course ID is missing
                      sx={{ textTransform: 'none' }}
                    >
                      {(course.progress || 0) > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default MyCourses;