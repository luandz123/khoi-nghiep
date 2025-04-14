import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Button, Card, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Chip, Divider,
  Avatar, Rating, Tab, Tabs, Dialog, DialogContent, IconButton, CardContent, 
  CircularProgress, Paper, Badge, Tooltip, ButtonGroup
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayCircleOutline as PlayCircleIcon,
  QuestionAnswer as QuizIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  BarChart as LevelIcon,
  Group as StudentsIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Description as DescriptionIcon,
  Forum as ForumIcon,
  CloudDownload as DownloadIcon,
  Note as NoteIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import './CourseDetailPage.css';

// Import các component con
import CourseOverview from '../components/CourseOverview';
import LessonPlayer from '../components/LessonPlayer';
import QuizPlayer from '../components/QuizPlayer';

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
  const [lessons, setLessons] = useState({});
  const [contentTab, setContentTab] = useState(0); // Tab cho phần nội dung khi xem bài học

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
            
            // Pre-load lessons for chapters
            if (chaptersResponse.data.length > 0) {
              chaptersResponse.data.forEach(chapter => {
                fetchLessonsForChapter(chapter.id);
              });
              
              // Auto-expand first chapter
              setExpandedChapter(chaptersResponse.data[0].id);
            }
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

  const handleContentTabChange = (event, newValue) => {
    setContentTab(newValue);
  };

  const handleChapterClick = (chapterId) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    
    // Fetch lessons for the chapter if not already loaded
    if (chapterId && !lessons[chapterId]) {
      fetchLessonsForChapter(chapterId);
    }
  };
  
  const fetchLessonsForChapter = async (chapterId) => {
    try {
      const response = await axiosInstance.get(`/lessons/chapter/${chapterId}`);
      setLessons(prev => ({
        ...prev,
        [chapterId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching lessons for chapter:', error);
      // Set mock data if API fails
      setLessons(prev => ({
        ...prev,
        [chapterId]: Array.from({ length: chapters.find(c => c.id === chapterId).lessonsCount }, (_, i) => ({
          id: `${chapterId}-${i+1}`,
          title: `Bài ${i+1}: ${i % 2 === 0 ? 'Video' : 'Quiz'} - ${chapters.find(c => c.id === chapterId).title}`,
          type: i % 2 === 0 ? 'VIDEO' : 'QUIZ',
          duration: i % 2 === 0 ? '10:30' : '5 câu hỏi',
          content: i % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
          completed: i < (chapters.find(c => c.id === chapterId).completedLessons || 0)
        }))
      }));
    }
  };

  const handleLessonClick = (chapterId, lesson) => {
    setCurrentChapter(chapterId);
    setCurrentLesson(lesson);
    setContentTab(0); // Reset về tab nội dung chính khi chuyển bài
  };

  // Tìm bài học trước và sau
  const findAdjacentLessons = () => {
    if (!currentLesson || !currentChapter) return { prev: null, next: null };
    
    // Tạo mảng phẳng của tất cả bài học từ tất cả chương
    let allLessons = [];
    let currentIndex = -1;
    
    chapters.forEach(chapter => {
      if (lessons[chapter.id]) {
        const chapterLessons = lessons[chapter.id].map(lesson => ({
          ...lesson,
          chapterId: chapter.id
        }));
        allLessons = [...allLessons, ...chapterLessons];
      }
    });
    
    // Tìm vị trí bài học hiện tại
    currentIndex = allLessons.findIndex(lesson => 
      lesson.id === currentLesson.id && lesson.chapterId === currentChapter
    );
    
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    };
  };
  
  const handleNavigateLesson = (direction) => {
    const { prev, next } = findAdjacentLessons();
    const targetLesson = direction === 'next' ? next : prev;
    
    if (targetLesson) {
      handleLessonClick(targetLesson.chapterId, targetLesson);
    }
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
        
        // Pre-load lessons for chapters after enrollment
        chapters.forEach(chapter => {
          fetchLessonsForChapter(chapter.id);
        });
        
        // Auto-expand first chapter
        if (chapters.length > 0) {
          setExpandedChapter(chapters[0].id);
        }
        
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

  const handleReturnToCourse = () => {
    setCurrentLesson(null);
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      await axiosInstance.post(`/lessons/${lessonId}/complete`);
      
      // Update the local state to show completion
      if (currentChapter && lessons[currentChapter]) {
        setLessons(prev => {
          const updatedLessons = prev[currentChapter].map(lesson => 
            lesson.id === lessonId ? { ...lesson, completed: true } : lesson
          );
          return {
            ...prev,
            [currentChapter]: updatedLessons
          };
        });
        
        // Update chapter completion count
        setChapters(prev => 
          prev.map(chapter => 
            chapter.id === currentChapter 
              ? { ...chapter, completedLessons: (chapter.completedLessons || 0) + 1 } 
              : chapter
          )
        );
        
        // Update overall progress
        const newCompletedLessons = chapters.reduce(
          (total, chapter) => chapter.id === currentChapter 
            ? total + (chapter.completedLessons || 0) + 1 
            : total + (chapter.completedLessons || 0), 
          0
        );
        const totalLessons = chapters.reduce((total, chapter) => total + chapter.lessonsCount, 0);
        const newProgress = Math.round((newCompletedLessons / totalLessons) * 100);
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography variant="h5" sx={{ ml: 2 }}>Đang tải...</Typography>
      </Box>
    );
  }

  // Calculate total lessons and completed lessons
  const totalLessons = chapters.reduce((total, chapter) => total + chapter.lessonsCount, 0);
  const completedLessons = chapters.reduce((total, chapter) => total + (chapter.completedLessons || 0), 0);

  // Render the course sidebar with lesson list
  const renderCourseSidebar = () => {
    const { prev, next } = findAdjacentLessons();
    
    return (
      <Paper elevation={2} sx={{ height: '100%' }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            Nội dung khóa học
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              <div className="progress-indicator" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                <div
                  className="progress-bar"
                  style={{ 
                    backgroundColor: 'white',
                    boxShadow: '0 0 5px rgba(255,255,255,0.7)',
                    width: `${progress}%` 
                  }}
                />
              </div>
            </Box>
            <Typography variant="caption" fontWeight="bold">
              {progress}%
            </Typography>
          </Box>
        </Box>

        <Divider />
        
        <Box sx={{ 
          maxHeight: currentLesson ? 'calc(100vh - 300px)' : 'calc(100vh - 200px)', 
          overflowY: 'auto', 
          pt: 1 
        }}>
          {chapters.map((chapter) => (
            <Accordion 
              key={chapter.id}
              expanded={expandedChapter === chapter.id}
              onChange={() => handleChapterClick(chapter.id)}
              disableGutters
              elevation={0}
              sx={{ 
                '&:before': { display: 'none' },
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 2, py: 1 }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {chapter.title}
                    </Typography>
                    <Badge 
                      badgeContent={`${chapter.completedLessons || 0}/${chapter.lessonsCount}`} 
                      color={chapter.completedLessons === chapter.lessonsCount ? "success" : "primary"}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 0 }}>
                <List dense disablePadding>
                  {lessons[chapter.id] ? (
                    lessons[chapter.id].map((lesson) => (
                      <ListItem
                        key={lesson.id}
                        button
                        selected={currentLesson && currentLesson.id === lesson.id}
                        onClick={() => handleLessonClick(chapter.id, lesson)}
                        sx={{ 
                          pl: 3,
                          borderLeft: currentLesson && currentLesson.id === lesson.id ? 
                            '3px solid #1976d2' : 'none',
                          bgcolor: currentLesson && currentLesson.id === lesson.id ? 
                            'rgba(25, 118, 210, 0.08)' : 'inherit',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {lesson.completed ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            lesson.type === 'VIDEO' ? (
                              <PlayCircleIcon fontSize="small" color="primary" />
                            ) : (
                              <QuizIcon fontSize="small" color="secondary" />
                            )
                          )}
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: currentLesson && currentLesson.id === lesson.id ? 'bold' : 'normal',
                                color: lesson.completed ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {lesson.title}
                            </Typography>
                          }
                          secondary={lesson.duration}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText 
                        primary={<CircularProgress size={20} />} 
                        secondary="Đang tải..." 
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        
        {currentLesson && (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <ButtonGroup fullWidth size="small" variant="outlined">
              <Button
                startIcon={<PrevIcon />}
                onClick={() => handleNavigateLesson('prev')}
                disabled={!prev}
              >
                Bài trước
              </Button>
              <Button
                endIcon={<NextIcon />}
                onClick={() => handleNavigateLesson('next')}
                disabled={!next}
              >
                Bài tiếp
              </Button>
            </ButtonGroup>
          </Box>
        )}
      </Paper>
    );
  };

  // Render enrollment card
  const renderEnrollmentCard = () => {
    return (
      <Card sx={{ position: 'sticky', top: 20 }} elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Đăng ký khóa học
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ display: 'flex', alignItems: 'center' }}>
            <TrophyIcon sx={{ color: 'warning.main', mr: 1 }} />
            Truy cập toàn bộ {totalLessons} bài học
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
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
    );
  };

  const renderContentTabs = () => {
    return (
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
        <Tabs
          value={contentTab}
          onChange={handleContentTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<DescriptionIcon fontSize="small" />} iconPosition="start" label="Nội dung" />
          <Tab icon={<ForumIcon fontSize="small" />} iconPosition="start" label="Hỏi đáp" />
          <Tab icon={<DownloadIcon fontSize="small" />} iconPosition="start" label="Tài liệu" />
          <Tab icon={<NoteIcon fontSize="small" />} iconPosition="start" label="Ghi chú" />
          <Tab icon={<AnnouncementIcon fontSize="small" />} iconPosition="start" label="Thông báo" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {contentTab === 0 && (
            <Typography variant="body2">
              {currentLesson?.description || "Mô tả bài học sẽ xuất hiện ở đây."}
            </Typography>
          )}
          {contentTab === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Hỏi đáp về bài học này</Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
              </Typography>
            </Box>
          )}
          {contentTab === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Tài liệu đính kèm</Typography>
              <Typography variant="body2" color="text.secondary">
                Không có tài liệu đính kèm cho bài học này.
              </Typography>
            </Box>
          )}
          {contentTab === 3 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Ghi chú cá nhân</Typography>
              <Typography variant="body2" color="text.secondary">
                Tính năng ghi chú đang được phát triển.
              </Typography>
            </Box>
          )}
          {contentTab === 4 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Thông báo từ giảng viên</Typography>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo mới.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Container className="course-detail-container" maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Course Title - only show when not in lesson view */}
      {!currentLesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            {courseDetail.title}
          </Typography>
        </motion.div>
      )}
      
      <Grid container spacing={3}>
        {/* Left Sidebar - always show for enrolled users */}
        {(isEnrolled || currentLesson) && (
          <Grid item xs={12} md={4} lg={3}>
            {renderCourseSidebar()}
          </Grid>
        )}
        
        {/* Main Content */}
        <Grid item xs={12} md={isEnrolled || currentLesson ? 8 : 8} lg={isEnrolled || currentLesson ? 9 : 8}>
          {currentLesson ? (
            <Box>
              {/* Lesson Title and Back Button */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                  onClick={handleReturnToCourse}
                  startIcon={<ArrowBackIcon />}
                  sx={{ mb: 1 }}
                >
                  Quay lại khóa học
                </Button>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Chia sẻ bài học">
                    <IconButton onClick={handleShareClick} size="small">
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Render appropriate content based on lesson type */}
              <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
                {currentLesson.type === 'QUIZ' ? (
                  <QuizPlayer 
                    lesson={currentLesson} 
                    onBack={handleReturnToCourse}  
                    onComplete={() => handleLessonComplete(currentLesson.id)} 
                  />
                ) : (
                  <LessonPlayer 
                    lesson={currentLesson} 
                    onBack={handleReturnToCourse} 
                    onComplete={() => handleLessonComplete(currentLesson.id)}
                    onShare={handleShareClick} 
                  />
                )}
              </Paper>
              
              {/* Additional Content Tabs */}
              {renderContentTabs()}
              
              {/* Navigation Buttons - Bottom */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <ButtonGroup variant="outlined">
                  <Button
                    startIcon={<PrevIcon />}
                    onClick={() => handleNavigateLesson('prev')}
                    disabled={!findAdjacentLessons().prev}
                  >
                    Bài trước
                  </Button>
                  <Button
                    endIcon={<NextIcon />}
                    onClick={() => handleNavigateLesson('next')}
                    disabled={!findAdjacentLessons().next}
                  >
                    Bài tiếp
                  </Button>
                </ButtonGroup>
                
                {!currentLesson.completed && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={() => handleLessonComplete(currentLesson.id)}
                  >
                    Đánh dấu hoàn thành
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            // Course Overview
            <CourseOverview 
              courseDetail={courseDetail}
              chapters={chapters}
              lessons={lessons}
              currentTab={currentTab}
              expandedChapter={expandedChapter}
              progress={progress}
              totalLessons={totalLessons}
              completedLessons={completedLessons}
              handleTabChange={handleTabChange}
              handleChapterClick={handleChapterClick}
              handleLessonClick={handleLessonClick}
              handleShareClick={handleShareClick}
              isEnrolled={isEnrolled}
              onEnroll={handleEnrollCourse}
            />
          )}
        </Grid>
        
        {/* Right Sidebar - only show for non-enrolled users when not viewing a lesson */}
        {!isEnrolled && !currentLesson && (
          <Grid item xs={12} md={4}>
            {renderEnrollmentCard()}
          </Grid>
        )}
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