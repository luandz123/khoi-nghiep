// src/components/mycourses/MyCourses.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Box, CircularProgress, LinearProgress, Chip
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosConfig';
import './MyCourses.css';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await axiosInstance.get('/courses/my-courses');
        setCourses(response.data || []);
      } catch (error) {
        console.error('Error fetching my courses:', error);
        if (error.response?.status === 401) {
          navigate('/login', { state: { from: '/my-courses' } });
        } else {
          setCourses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [navigate]);

  // Function to extract YouTube thumbnail
  const getYoutubeThumbnail = (url) => {
    if (!url) return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';
    
    try {
      const videoId = url.includes('v=') 
        ? url.split('v=')[1].split('&')[0]
        : url.split('/').pop();
        
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } catch (error) {
      return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';
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
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <motion.div variants={itemVariants}>
                <Card className="my-course-card">
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={course.thumbnail || getYoutubeThumbnail(course.videoUrl)}
                      alt={course.title}
                      className="course-thumbnail"
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          icon={<TimerIcon sx={{ fontSize: '0.75rem !important' }} />}
                          label={course.duration || '10 giờ'}
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
                      sx={{ 
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '48px'
                      }}
                    >
                      {course.title}
                    </Typography>
                    
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={course.progress || 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: (course.progress || 0) >= 100 ? 'success.main' : 'primary.main',
                          }
                        }} 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {course.completedLessons || 0}/{course.totalLessons || 10} bài học
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