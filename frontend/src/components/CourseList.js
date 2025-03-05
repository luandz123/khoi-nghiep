import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button } from '@mui/material';
import './CourseList.css'; // Thêm import CSS

const getYoutubeId = (url) => {
  try {
    const urlObj = new URL(url);
    if(urlObj.hostname === 'youtu.be'){
      return urlObj.pathname.slice(1);
    } else if(urlObj.hostname.includes('youtube.com')){
      return urlObj.searchParams.get('v');
    }
    return null;
  } catch (error) {
    return null;
  }
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/api/courses') // Hoặc endpoint công khai phù hợp
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container>
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#1a237e' }}>
          Danh Sách Khóa Học
        </Typography>
        <Grid container spacing={3}>
          {courses.map(course => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card className="course-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.videoUrl ? `https://img.youtube.com/vi/${getYoutubeId(course.videoUrl)}/maxresdefault.jpg` : course.thumbnail || 'https://via.placeholder.com/300x200'}
                  alt={course.title}
                  className="course-image"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }} className="course-title">
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="course-description"
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
                  >
                    {course.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth variant="contained"
                    sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', color: 'white', '&:hover': { background: 'linear-gradient(45deg, #1976D2 30%, #1AC6E9 90%)' } }}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="course-button"
                  >
                    Xem ngay
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CourseList;