import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { Person as PersonIcon, School as SchoolIcon, Star as StarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  // Function to extract YouTube thumbnail from video URL
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

  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <Card 
      className="course-card-container" 
      onClick={handleClick}
      elevation={2}
    >
      <Box className="image-wrapper">
        <CardMedia
          component="img"
          image={course.thumbnail || getYoutubeThumbnail(course.videoUrl)}
          alt={course.title}
          className="course-thumbnail"
        />
        
        <Box className="course-card-overlay">
          <Chip 
            label={course.categoryName || 'Course'} 
            size="small" 
            className="category-chip"
          />
          <Chip 
            label={course.level || 'Beginner'} 
            size="small" 
            className="level-chip"
          />
        </Box>
      </Box>
      
      <CardContent className="course-content">
        <Typography variant="h6" className="course-title">
          {course.title}
        </Typography>
        
        <Box className="course-meta">
          <Box className="meta-item">
            <PersonIcon fontSize="small" />
            <Typography variant="body2">
              {course.instructor || 'Instructor'}
            </Typography>
          </Box>
          
          <Box className="meta-item">
            <SchoolIcon fontSize="small" />
            <Typography variant="body2">
              {course.studentsCount || 0} students
            </Typography>
          </Box>
          
          <Box className="meta-item">
            <StarIcon fontSize="small" />
            <Typography variant="body2">
              {course.rating || 4.5}
            </Typography>
          </Box>
        </Box>
        
        <Box className="action-area">
          <Box className="view-button">
            Xem khóa học
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;