import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Container, Typography, Button, Breadcrumbs, 
  CircularProgress, Alert, LinearProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  NavigateBefore as NavigateBeforeIcon, 
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';
import LessonPlayer from '../components/LessonPlayer';
import './LessonPage.css';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseInfo, setCourseInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentLessonData, setCurrentLessonData] = useState(null);
  const [nextLessonId, setNextLessonId] = useState(null);
  const [prevLessonId, setPrevLessonId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course info
        const courseResponse = await axiosInstance.get(`/courses/${courseId}`);
        setCourseInfo(courseResponse.data);
        
        // Fetch course progress
        const progressResponse = await axiosInstance.get(`/courses/${courseId}/progress`);
        setProgress(progressResponse.data.percentComplete || 0);
        
        // Fetch course chapters
        const chaptersResponse = await axiosInstance.get(`/courses/${courseId}/chapters`);
        const chapters = chaptersResponse.data || [];
        
        // Find current lesson's chapter
        let foundChapter = null;
        let foundLesson = null;
        let nextLesson = null;
        let prevLesson = null;
        
        // Create a flat list of all lessons
        const allLessons = [];
        
        for (const chapter of chapters) {
          // Fetch lessons for each chapter
          const lessonsResponse = await axiosInstance.get(`/chapters/${chapter.id}/lessons`);
          const lessons = lessonsResponse.data || [];
          
          for (const lesson of lessons) {
            allLessons.push({
              ...lesson,
              chapterId: chapter.id,
              chapterTitle: chapter.title
            });
            
            if (lesson.id === parseInt(lessonId)) {
              foundChapter = chapter;
              foundLesson = lesson;
            }
          }
        }
        
        // Find next and previous lessons
        const currentIndex = allLessons.findIndex(lesson => lesson.id === parseInt(lessonId));
        if (currentIndex > 0) {
          prevLesson = allLessons[currentIndex - 1];
          setPrevLessonId(prevLesson.id);
        }
        
        if (currentIndex < allLessons.length - 1) {
          nextLesson = allLessons[currentIndex + 1];
          setNextLessonId(nextLesson.id);
        }
        
        setCurrentChapter(foundChapter);
        setCurrentLessonData(foundLesson);
      } catch (err) {
        console.error('Error fetching lesson data:', err);
        setError('Không thể tải dữ liệu bài học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId]);
  
  const handleBackToCourse = () => {
    navigate(`/courses/${courseId}`);
  };
  
  const handleNavigate = (lessonId) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8, minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToCourse}
        >
          Quay lại khóa học
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="/" className="breadcrumb-link">
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Trang chủ
          </Link>
          <Link to="/courses" className="breadcrumb-link">
            Khóa học
          </Link>
          <Link to={`/courses/${courseId}`} className="breadcrumb-link">
            {courseInfo?.title || 'Chi tiết khóa học'}
          </Link>
          <Typography color="text.primary">
            {currentLessonData?.title || 'Bài học'}
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box className="lesson-page-header">
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToCourse}
            sx={{ mb: 2 }}
          >
            Quay lại khóa học
          </Button>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {courseInfo?.title || 'Khóa học'}
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary">
            Chương: {currentChapter?.title || ''}
          </Typography>
        </Box>
        
        <Box sx={{ width: '200px' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tiến độ khóa học: {progress}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 5,
              bgcolor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              }
            }}
          />
        </Box>
      </Box>
      
      {currentChapter && currentLessonData ? (
        <>
          <LessonPlayer 
            courseId={courseId} 
            chapterId={currentChapter.id}
            initialLessonId={lessonId}
          />
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeIcon />}
              onClick={() => prevLessonId && handleNavigate(prevLessonId)}
              disabled={!prevLessonId}
            >
              Bài học trước
            </Button>
            
            <Button
              variant="contained"
              endIcon={<NavigateNextIcon />}
              onClick={() => nextLessonId && handleNavigate(nextLessonId)}
              disabled={!nextLessonId}
            >
              Bài học tiếp theo
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bài học không tồn tại hoặc bạn không có quyền truy cập.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToCourse}
          >
            Quay lại khóa học
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default LessonPage;