// src/pages/CourseDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Button, Card, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Chip, Divider,
  Avatar, Rating, Tab, Tabs, Dialog, DialogContent, DialogActions, IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayCircleOutline as PlayCircleIcon,
  QuestionAnswer as QuizIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  BarChart as LevelIcon,
  Group as StudentsIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseDetail, setCourseDetail] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseResponse = await axiosInstance.get(`/courses/${id}`);
        setCourseDetail(courseResponse.data);
        
        // Fetch course chapters
        const chaptersResponse = await axiosInstance.get(`/courses/${id}/chapters`);
        setChapters(chaptersResponse.data);
        
        // Check if user is enrolled
        try {
          const enrollmentResponse = await axiosInstance.get(`/courses/enrollment-status/${id}`);
          setIsEnrolled(enrollmentResponse.data);
          
          // If enrolled, fetch progress
          if (enrollmentResponse.data) {
            const progressResponse = await axiosInstance.get(`/courses/${id}/progress`);
            setProgress(progressResponse.data.percentComplete || 0);
          }
        } catch (error) {
          console.log('Not logged in or not enrolled');
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        // Set mock data for testing if API fails
        setMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [id]);
  
  // Set mock data for testing if API fails
  const setMockData = () => {
    setCourseDetail({
      id: parseInt(id),
      title: 'Khóa học ReactJS cho người mới bắt đầu',
      description: 'Học cách xây dựng các ứng dụng web hiện đại với ReactJS, thư viện JavaScript phổ biến nhất hiện nay để phát triển giao diện người dùng.',
      instructor: 'Nguyễn Văn Luan',
      duration: '15 giờ',
      level: 'Người mới bắt đầu',
      studentsCount: 1205,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://via.placeholder.com/640x360.png?text=React+JS+Course',
      rating: 4.8,
      categoryName: 'Lập trình Web',
    });
    
    setChapters([
      {
        id: 1,
        title: 'Giới thiệu về ReactJS',
        description: 'Tổng quan về ReactJS và các khái niệm cơ bản',
        order: 1,
        lessonsCount: 3,
        completedLessons: 2
      },
      {
        id: 2,
        title: 'Components và Props',
        description: 'Học cách tạo và sử dụng components',
        order: 2,
        lessonsCount: 4,
        completedLessons: 1
      },
      {
        id: 3,
        title: 'State và Lifecycle',
        description: 'Quản lý trạng thái và vòng đời của components',
        order: 3,
        lessonsCount: 5,
        completedLessons: 0
      }
    ]);
    
    setProgress(25);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleChapterClick = (chapterId) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const handleLessonClick = (chapterId, lesson) => {
    setCurrentChapter(chapterId);
    setCurrentLesson(lesson);
    setCurrentTab(1); // Switch to content tab
  };

  const handleEnrollCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/courses/${id}` } });
        return;
      }
      
      const response = await axiosInstance.post(`/courses/enroll/${id}`);
      if (response.data && response.data.success) {
        setIsEnrolled(true);
        alert('Đăng ký khóa học thành công!');
      } else {
        alert(response.data?.message || 'Đăng ký khóa học thất bại. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: `/courses/${id}` } });
      } else {
        alert('Đã xảy ra lỗi khi đăng ký khóa học. Vui lòng thử lại sau.');
      }
    }
  };

  const handleShareClick = () => {
    setShowShareDialog(true);
  };

  const handleCopyLink = (type) => {
    let textToCopy = '';
    
    if (type === 'link') {
      textToCopy = window.location.href;
    } else if (type === 'facebook') {
      textToCopy = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(textToCopy, '_blank');
      return;
    } else if (type === 'twitter') {
      textToCopy = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(courseDetail?.title || 'Check out this course!')}`;
      window.open(textToCopy, '_blank');
      return;
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess('Đã sao chép!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Lỗi khi sao chép: ', err);
        setCopySuccess('Không thể sao chép');
      });
  };

  const toggleFavorite = () => {
    setFavorited(!favorited);
  };

  // Function to get YouTube embed URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    
    try {
      const videoId = url.includes('v=') 
        ? url.split('v=')[1].split('&')[0]
        : url.split('/').pop();
        
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return url;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography variant="h5">Đang tải...</Typography>
      </Box>
    );
  }

  // Calculate total lessons and completed lessons
  const totalLessons = chapters.reduce((total, chapter) => total + chapter.lessonsCount, 0);
  const completedLessons = chapters.reduce((total, chapter) => total + (chapter.completedLessons || 0), 0);

  return (
    <Container className="course-detail-container" maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {currentLesson ? (
            // Lesson View
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={() => setCurrentLesson(null)}
                sx={{ mb: 2 }}
                startIcon={<ArrowBackIcon />}
              >
                Quay lại khóa học
              </Button>
              
              {/* Video Player */}
              <div className="video-container">
                <iframe
                  src={getYoutubeEmbedUrl(courseDetail.videoUrl)}
                  title={courseDetail.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                {currentLesson.title}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {currentLesson.description}
              </Typography>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon />}
                >
                  Đánh dấu hoàn thành
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShareClick}
                >
                  Chia sẻ
                </Button>
              </Box>
            </motion.div>
          ) : (
            // Course Overview
            <Box>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {courseDetail.title}
                </Typography>
                
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <Chip
                    label={courseDetail.categoryName}
                    color="primary"
                    variant="outlined"
                    size="small"
                    className="stat-chip"
                  />
                  
                  <Chip
                    icon={<LevelIcon fontSize="small" />}
                    label={courseDetail.level}
                    variant="outlined"
                    size="small"
                    className="stat-chip"
                  />
                  
                  <Chip
                    icon={<TimerIcon fontSize="small" />}
                    label={courseDetail.duration}
                    variant="outlined"
                    size="small"
                    className="stat-chip"
                  />
                  
                  <Chip
                    icon={<StudentsIcon fontSize="small" />}
                    label={`${courseDetail.studentsCount || 0} học viên`}
                    variant="outlined"
                    size="small"
                    className="stat-chip"
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={courseDetail.rating || 4.5} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      ({courseDetail.rating || 4.5})
                    </Typography>
                  </Box>
                </Box>
                
                {/* Video preview */}
                <div className="video-container">
                  <iframe
                    src={getYoutubeEmbedUrl(courseDetail.videoUrl)}
                    title={courseDetail.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                <Box sx={{ mt: 4 }}>
                  <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label="Giới thiệu" />
                    <Tab label="Nội dung khóa học" />
                    <Tab label="Đánh giá" />
                  </Tabs>
                  
                  <Box className="tab-content">
                    {currentTab === 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Tổng quan khóa học
                        </Typography>
                        
                        <Typography variant="body1" paragraph>
                          {courseDetail.description}
                        </Typography>
                        
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
                          Giảng viên
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar
                            src="https://via.placeholder.com/100"
                            alt={courseDetail.instructor}
                            sx={{ width: 64, height: 64, mr: 2 }}
                            className="instructor-avatar"
                          />
                          
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {courseDetail.instructor}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Giảng viên Lập trình Web
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body1" paragraph>
                          Giảng viên có nhiều năm kinh nghiệm trong lĩnh vực phát triển web và đào tạo lập trình.
                        </Typography>
                      </Box>
                    )}
                    
                    {currentTab === 1 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Nội dung khóa học
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {totalLessons} bài học • {completedLessons} hoàn thành
                        </Typography>
                        
                        {chapters.map((chapter) => (
                          <Accordion
                            key={chapter.id}
                            expanded={expandedChapter === chapter.id}
                            onChange={() => handleChapterClick(chapter.id)}
                            sx={{ mb: 2 }}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {chapter.title}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {chapter.lessonsCount} bài học
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                      {chapter.completedLessons || 0}/{chapter.lessonsCount}
                                    </Typography>
                                    
                                    <div className="progress-indicator" style={{ width: '60px' }}>
                                      <div
                                        className="progress-bar"
                                        style={{
                                          width: `${chapter.lessonsCount > 0 
                                            ? ((chapter.completedLessons || 0) / chapter.lessonsCount) * 100 
                                            : 0}%`
                                        }}
                                      />
                                    </div>
                                  </Box>
                                </Box>
                              </Box>
                            </AccordionSummary>
                            
                            <AccordionDetails sx={{ p: 0 }}>
                              <List disablePadding>
                                {/* Mock lessons since we don't have actual lesson data */}
                                {Array.from({ length: chapter.lessonsCount }, (_, i) => ({
                                  id: `${chapter.id}-${i+1}`,
                                  title: `Bài ${i+1}: ${i % 2 === 0 ? 'Video' : 'Quiz'} - ${chapter.title}`,
                                  type: i % 2 === 0 ? 'VIDEO' : 'QUIZ',
                                  completed: i < (chapter.completedLessons || 0)
                                })).map((lesson) => (
                                  <ListItem
                                    key={lesson.id}
                                    className={`lesson-item ${lesson.completed ? 'completed' : ''}`}
                                    onClick={() => handleLessonClick(chapter.id, lesson)}
                                    sx={{ cursor: 'pointer' }}
                                  >
                                    <ListItemIcon>
                                      {lesson.type === 'VIDEO' ? (
                                        <PlayCircleIcon color="primary" />
                                      ) : (
                                        <QuizIcon color="secondary" />
                                      )}
                                    </ListItemIcon>
                                    
                                    <ListItemText
                                      primary={lesson.title}
                                      secondary={lesson.type === 'VIDEO' ? 'Video bài giảng' : 'Bài kiểm tra'}
                                    />
                                    
                                    {lesson.completed && (
                                      <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                                    )}
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}
                    
                    {currentTab === 2 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Đánh giá từ học viên
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Box sx={{ mr: 3, textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {courseDetail.rating || 4.8}
                            </Typography>
                            <Rating value={courseDetail.rating || 4.8} precision={0.5} readOnly />
                            <Typography variant="body2" color="text.secondary">
                              ({courseDetail.reviewsCount || 24} đánh giá)
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            {/* Rating bars - Mock data */}
                            {[5, 4, 3, 2, 1].map((star) => (
                              <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ minWidth: '20px', mr: 1 }}>
                                  {star}
                                </Typography>
                                <Box 
                                  sx={{ 
                                    height: 8, 
                                    bgcolor: 'grey.300', 
                                    borderRadius: 4, 
                                    width: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      height: '100%',
                                      borderRadius: 4,
                                      bgcolor: 'primary.main',
                                      width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%`
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ ml: 1, minWidth: '30px' }}>
                                  {star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                        
                        <Divider sx={{ mb: 3 }} />
                        
                        {/* Mock reviews */}
                        {[
                          { name: 'Nguyễn Văn A', avatar: 'https://via.placeholder.com/100', rating: 5, comment: 'Khóa học rất hay và bổ ích. Tôi đã học được rất nhiều kiến thức mới.' },
                          { name: 'Trần Thị B', avatar: 'https://via.placeholder.com/100?text=B', rating: 4, comment: 'Giảng viên trình bày dễ hiểu. Tuy nhiên có một số bài tập còn khó.' },
                          { name: 'Lê Văn C', avatar: 'https://via.placeholder.com/100?text=C', rating: 5, comment: 'Tuyệt vời! Tôi đã áp dụng được những kiến thức học được vào công việc.' }
                        ].map((review, index) => (
                          <Card key={index} className="review-card" sx={{ mb: 2, p: 2 }}>
                            <Box sx={{ display: 'flex', mb: 1 }}>
                              <Avatar src={review.avatar} alt={review.name} sx={{ mr: 2 }} />
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {review.name}
                                </Typography>
                                <Rating value={review.rating} size="small" readOnly />
                              </Box>
                            </Box>
                            <Typography variant="body2">
                              {review.comment}
                            </Typography>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </motion.div>
            </Box>
          )}
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card className="course-info-card" sx={{ position: 'sticky', top: 100 }}>
            <CardContent sx={{ p: 3 }}>
              {isEnrolled ? (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Tiến độ của bạn
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Hoàn thành: {completedLessons}/{totalLessons} bài học
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {progress}%
                      </Typography>
                    </Box>
                    
                    <div className="progress-indicator">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => {
                      // Find first incomplete lesson
                      for (const chapter of chapters) {
                        if ((chapter.completedLessons || 0) < chapter.lessonsCount) {
                          handleChapterClick(chapter.id);
                          
                          // Mock finding the first incomplete lesson
                          const incompleteLesson = {
                            id: `${chapter.id}-${chapter.completedLessons + 1}`,
                            title: `Bài ${chapter.completedLessons + 1}: ${chapter.title}`,
                            type: 'VIDEO',
                            completed: false
                          };
                          
                          handleLessonClick(chapter.id, incompleteLesson);
                          break;
                        }
                      }
                    }}
                    className="continue-button"
                    sx={{ mb: 2 }}
                  >
                    Tiếp tục học
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Đăng ký khóa học
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    <TrophyIcon sx={{ color: 'warning.main', verticalAlign: 'middle', mr: 1 }} />
                    Truy cập toàn bộ {totalLessons} bài học
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    <CheckCircleIcon sx={{ color: 'success.main', verticalAlign: 'middle', mr: 1 }} />
                    Học bất kỳ đâu, bất kỳ lúc nào
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleEnrollCourse}
                    className="enroll-button"
                    sx={{ mb: 2 }}
                  >
                    Đăng ký ngay
                  </Button>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  startIcon={favorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  onClick={toggleFavorite}
                >
                  {favorited ? 'Đã yêu thích' : 'Yêu thích'}
                </Button>
                
                <Button
                  startIcon={<ShareIcon />}
                  onClick={handleShareClick}
                >
                  Chia sẻ
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Share Dialog */}
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Chia sẻ khóa học</Typography>
            <IconButton onClick={() => setShowShareDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Button
            variant="outlined"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => handleCopyLink('link')}
          >
            {copySuccess || 'Sao chép đường dẫn'}
          </Button>
          
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1, bgcolor: '#3b5998' }}
            onClick={() => handleCopyLink('facebook')}
          >
            Chia sẻ lên Facebook
          </Button>
          
          <Button
            variant="contained"
            fullWidth
            sx={{ bgcolor: '#1DA1F2' }}
            onClick={() => handleCopyLink('twitter')}
          >
            Chia sẻ lên Twitter
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CourseDetailPage;