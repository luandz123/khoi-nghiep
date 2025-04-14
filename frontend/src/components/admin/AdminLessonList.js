/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Button, TextField, Box, Card, CardContent,
  IconButton, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Snackbar, Alert, Tabs, Tab, Divider, Breadcrumbs, Link, Grid
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  Save as SaveIcon,
  VideoLibrary as VideoIcon,
  QuestionAnswer as QuizIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  NavigateNext as NavigateNextIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axiosInstance from '../../utils/axiosConfig';

const AdminLessonList = ({ initialChapterId }) => {
  const navigate = useNavigate();
  // State for course and chapter selection
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId || '');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [selectedChapterName, setSelectedChapterName] = useState('');

  // State for lessons
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentLesson, setCurrentLesson] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);

  // Form states
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('VIDEO');
  const [videoUrl, setVideoUrl] = useState('');

  // Quiz states
  const [questions, setQuestions] = useState([{ questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: true }] }]);

  // Fetch all courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await axiosInstance.get('/admin/courses');
        setCourses(response.data);

        // If initialChapterId is provided, we need to find the related course
        if (initialChapterId) {
          // Find the chapter to get the course ID
          try {
            const chapterResponse = await axiosInstance.get(`/chapters/${initialChapterId}`);
            const chapter = chapterResponse.data;
            const chapterCourseId = chapter.course?.id;

            if (chapterCourseId) {
              setSelectedCourseId(chapterCourseId.toString());

              // Find the course name in the fetched courses
              const course = response.data.find(
                c => c.id.toString() === chapterCourseId.toString()
              );
              if (course) {
                setSelectedCourseName(course.title);
              }

              // Fetch chapters for this course
              fetchChapters(chapterCourseId);
            }

            // Set the chapter name
            setSelectedChapterName(chapter.title);
          } catch (error) {
            console.error('Error fetching chapter details:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setNotification({
          open: true,
          message: 'Không thể tải danh sách khóa học. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [initialChapterId]);

  // Fetch chapters when course changes
  const fetchChapters = useCallback(async (courseId) => {
    if (!courseId) return;

    setLoadingChapters(true);
    try {
      const response = await axiosInstance.get(`/chapters/course/${courseId}`);
      setChapters(response.data);

      // If initialChapterId is set and we just fetched chapters, select it
      if (initialChapterId && response.data.some(c => c.id.toString() === initialChapterId.toString())) {
        setSelectedChapterId(initialChapterId);
      } else if (response.data.length > 0) {
        // Otherwise, select the first chapter by default
        setSelectedChapterId(response.data[0].id.toString());
        setSelectedChapterName(response.data[0].title);
      } else {
        setSelectedChapterId('');
        setSelectedChapterName('');
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setNotification({
        open: true,
        message: 'Không thể tải danh sách chương. Vui lòng thử lại sau.',
        severity: 'error'
      });
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  }, [initialChapterId]);

  // Fetch lessons when chapter changes
  const fetchLessons = useCallback(async () => {
    if (!selectedChapterId) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/lessons/chapter/${selectedChapterId}`);
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setNotification({
        open: true,
        message: 'Không thể tải danh sách bài học. Vui lòng thử lại sau.',
        severity: 'error'
      });
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChapterId]);

  // Effect to fetch lessons when selected chapter changes
  useEffect(() => {
    fetchLessons();
  }, [selectedChapterId, fetchLessons]);

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);

    // Update course name
    if (courseId) {
      const course = courses.find(c => c.id.toString() === courseId.toString());
      if (course) {
        setSelectedCourseName(course.title);
      }
    } else {
      setSelectedCourseName('');
    }

    // Reset chapter selection
    setSelectedChapterId('');
    setSelectedChapterName('');

    // Fetch chapters for the selected course
    fetchChapters(courseId);

    // Reset lesson-related states
    setLessons([]);
    setReorderMode(false);
  };

  const handleChapterChange = (event) => {
    const chapterId = event.target.value;
    setSelectedChapterId(chapterId);

    // Update chapter name
    if (chapterId) {
      const chapter = chapters.find(c => c.id.toString() === chapterId.toString());
      if (chapter) {
        setSelectedChapterName(chapter.title);
      }
    } else {
      setSelectedChapterName('');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAddDialog = () => {
    if (!selectedChapterId) {
      setNotification({
        open: true,
        message: 'Vui lòng chọn một chương trước khi thêm bài học.',
        severity: 'warning'
      });
      return;
    }

    setFormMode('add');
    setLessonTitle('');
    setLessonType('VIDEO');
    setVideoUrl('');
    setQuestions([{ questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: true }] }]); // Reset questions
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (lesson) => {
    setFormMode('edit');
    setCurrentLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonType(lesson.type);
    setVideoUrl(lesson.videoUrl || '');

    // If it's a quiz, load the questions
    if (lesson.type === 'QUIZ') {
      if (lesson.questions && lesson.questions.length > 0) {
        // Format questions to match the state structure
        const formattedQuestions = lesson.questions.map(q => {
          // Find the correct option index - Đảm bảo rằng correctAnswer là số dạng chuỗi
          const correctOptionIndex = q.correctAnswer !== undefined ? 
            parseInt(q.correctAnswer, 10) : -1;
          
          console.log('Loading question:', q.questionText, 'correctAnswer:', q.correctAnswer, 'as index:', correctOptionIndex);
          
          // Format options to have isCorrect flag
          // Quan trọng: Đánh dấu đáp án đúng dựa vào index
          const options = Array.isArray(q.options) ? q.options.map((opt, idx) => {
            // Nếu là string thì chuyển về object
            if (typeof opt === 'string') {
              return {
                text: opt,
                isCorrect: idx === correctOptionIndex
              };
            }
            return {
              text: opt.text || '',
              isCorrect: idx === correctOptionIndex
            };
          }) : [];
          
          return {
            id: q.id, // Keep the ID for updating existing questions
            questionText: q.questionText || '',
            options: options.length > 0 ? options : [
              { text: '', isCorrect: false },
              { text: '', isCorrect: true }
            ]
          };
        });
        
        setQuestions(formattedQuestions);
      } else {
        setQuestions([{ 
          questionText: '', 
          options: [{ text: '', isCorrect: false }, { text: '', isCorrect: true }] 
        }]);
      }
    } else {
      setQuestions([{ 
        questionText: '', 
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: true }] 
      }]);
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentLesson(null);
  };

  const handleSubmit = async () => {
    if (!lessonTitle.trim()) {
      setNotification({
        open: true,
        message: 'Tiêu đề bài học không được để trống!',
        severity: 'warning'
      });
      return;
    }

    if (lessonType === 'VIDEO' && !videoUrl.trim()) {
      setNotification({
        open: true,
        message: 'URL video không được để trống với bài học dạng video!',
        severity: 'warning'
      });
      return;
    }

    try {
      // Step 1: Create or update basic lesson information
      let payload = {
        title: lessonTitle,
        type: lessonType
      };
      
      if (lessonType === 'VIDEO') {
        payload.videoUrl = videoUrl;
      }

      let savedLesson;
      
      if (formMode === 'add') {
        const response = await axiosInstance.post(`/lessons/chapter/${selectedChapterId}`, payload);
        savedLesson = response.data;
        
        setNotification({
          open: true,
          message: 'Thêm bài học thành công!',
          severity: 'success'
        });
      } else {
        const response = await axiosInstance.put(`/lessons/${currentLesson.id}`, payload);
        savedLesson = response.data;
        
        setNotification({
          open: true,
          message: 'Cập nhật bài học thành công!',
          severity: 'success'
        });
      }

      // Step 2: If it's a quiz, save the questions
      if (lessonType === 'QUIZ') {
        const lessonId = savedLesson.id || currentLesson.id;
        let hasQuestionsError = false;
        
        // Process each question
        for (const question of questions) {
          if (!question.questionText.trim()) continue;
          
          // Find the correct option index
          const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
          if (correctOptionIndex === -1) continue;
          
          // Prepare options with clear ID based on index
          // Important: option ID MUST be the index as string
          const formattedOptions = question.options.map((opt, index) => ({
            id: index.toString(),  // Use index as ID (string)
            text: opt.text
          }));
          
          try {
            const questionPayload = {
              questionText: question.questionText,
              correctAnswer: correctOptionIndex.toString(), // Save correct answer as index string
              options: formattedOptions
            };
            
            console.log("Saving question with payload:", questionPayload);
            
            if (question.id) {
              // Update existing question
              await axiosInstance.put(`/quizzes/questions/${question.id}`, questionPayload);
              console.log(`Updated question ${question.id}`);
            } else {
              // Create new question
              await axiosInstance.post(`/quizzes/lesson/${lessonId}/questions`, questionPayload);
              console.log(`Created new question for lesson ${lessonId}`);
            }
          } catch (error) {
            console.error('Error saving quiz question:', error);
            hasQuestionsError = true;
          }
        }
        
        if (hasQuestionsError) {
          setNotification({
            open: true,
            message: 'Đã xảy ra lỗi khi lưu một số câu hỏi. Vui lòng kiểm tra lại.',
            severity: 'warning'
          });
        } else {
          setNotification({
            open: true,
            message: formMode === 'add' ? 
              'Thêm bài quiz và câu hỏi thành công!' : 
              'Cập nhật bài quiz và câu hỏi thành công!',
            severity: 'success'
          });
        }
      }

      handleCloseDialog();
      fetchLessons(); // Refresh the lessons list
    } catch (error) {
      console.error('Error saving lesson:', error);
      setNotification({
        open: true,
        message: `Lỗi khi lưu bài học: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;

    try {
      await axiosInstance.delete(`/lessons/${lessonId}`);
      setNotification({
        open: true,
        message: 'Xóa bài học thành công!',
        severity: 'success'
      });
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setNotification({
        open: true,
        message: `Lỗi khi xóa bài học: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    const reorderedLessons = Array.from(lessons);
    const [removed] = reorderedLessons.splice(startIndex, 1);
    reorderedLessons.splice(endIndex, 0, removed);

    setLessons(reorderedLessons);

    try {
      const lessonIds = reorderedLessons.map(lesson => lesson.id);
      await axiosInstance.put(`/lessons/reorder`, lessonIds);
      setNotification({
        open: true,
        message: 'Thứ tự bài học đã được cập nhật!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error reordering lessons:', error);
      setNotification({
        open: true,
        message: `Lỗi khi sắp xếp lại bài học: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
      fetchLessons(); // Tải lại thứ tự ban đầu
    }
  };

  const toggleReorderMode = () => {
    setReorderMode(!reorderMode);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return '';

    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[7].length === 11) ? match[7] : '';
  };

  // Quiz question handlers
  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      questionText: '', 
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: true }] 
    }]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionTextChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.map((option, index) => ({
      ...option,
      isCorrect: index === optionIndex
    }));
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ text: '', isCorrect: false });
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    
    // Ensure we have at least 2 options
    if (newQuestions[questionIndex].options.length <= 2) {
      setNotification({
        open: true,
        message: 'Mỗi câu hỏi cần ít nhất 2 lựa chọn',
        severity: 'warning'
      });
      return;
    }
    
    // Check if we're removing the correct option
    const isRemovingCorrectOption = newQuestions[questionIndex].options[optionIndex].isCorrect;
    
    // Remove the option
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    
    // If we removed the correct option, set the first option as correct
    if (isRemovingCorrectOption) {
      newQuestions[questionIndex].options[0].isCorrect = true;
    }
    
    setQuestions(newQuestions);
  };

  const handleNavigateToQuizManagement = (lessonId) => {
    navigate(`/admin/quizzes/${lessonId}`);
  };

  if (loadingCourses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải danh sách khóa học...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý bài học
      </Typography>

      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} underline="hover" color="inherit" to="/admin/dashboard">
          Trang quản trị
        </Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/admin/courses">
          Khóa học
        </Link>
        <Typography color="text.primary">Bài học</Typography>
      </Breadcrumbs>

      {/* Course and Chapter Selection */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Chọn khóa học và chương
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="course-select-label">Khóa học</InputLabel>
              <Select
                labelId="course-select-label"
                value={selectedCourseId}
                onChange={handleCourseChange}
                label="Khóa học"
                disabled={loadingCourses}
              >
                <MenuItem value="">
                  <em>-- Chọn khóa học --</em>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="chapter-select-label">Chương</InputLabel>
              <Select
                labelId="chapter-select-label"
                value={selectedChapterId}
                onChange={handleChapterChange}
                label="Chương"
                disabled={!selectedCourseId || loadingChapters || chapters.length === 0}
              >
                <MenuItem value="">
                  <em>-- Chọn chương --</em>
                </MenuItem>
                {chapters.map((chapter) => (
                  <MenuItem key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loadingChapters && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Đang tải danh sách chương...
            </Typography>
          </Box>
        )}
      </Paper>

      {selectedChapterId ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" component="span">
                {selectedCourseName}
              </Typography>
              <NavigateNextIcon sx={{ mx: 1 }} />
              <MenuBookIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="subtitle1" component="span">
                {selectedChapterName}
              </Typography>
            </Box>

            <Box>
              <Button
                variant="outlined"
                color={reorderMode ? "secondary" : "primary"}
                onClick={toggleReorderMode}
                sx={{ mr: 2 }}
                disabled={lessons.length <= 1}
              >
                {reorderMode ? "Thoát sắp xếp" : "Sắp xếp lại"}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                Thêm bài học
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: '100%', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Tất cả" />
              <Tab label="Bài học video" />
              <Tab label="Bài Quiz" />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Đang tải danh sách bài học...
              </Typography>
            </Box>
          ) : lessons.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Chưa có bài học nào trong chương này. Bấm "Thêm bài học" để bắt đầu.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="lessons" isDropDisabled={!reorderMode}>
                {(provided) => (
                  <TableContainer component={Paper} ref={provided.innerRef} {...provided.droppableProps}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {reorderMode && <TableCell width="50px"></TableCell>}
                          <TableCell>STT</TableCell>
                          <TableCell>Tiêu đề</TableCell>
                          <TableCell>Loại</TableCell>
                          <TableCell>Nội dung</TableCell>
                          <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lessons
                          .filter(lesson => {
                            if (tabValue === 1) return lesson.type === 'VIDEO';
                            if (tabValue === 2) return lesson.type === 'QUIZ';
                            return true;
                          })
                          .map((lesson, index) => (
                            <Draggable
                              key={lesson.id}
                              draggableId={lesson.id.toString()}
                              index={index}
                              isDragDisabled={!reorderMode}
                            >
                              {(provided) => (
                                <TableRow
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  sx={reorderMode ? { cursor: 'move' } : {}}
                                >
                                  {reorderMode && (
                                    <TableCell width="50px">
                                      <IconButton size="small" {...provided.dragHandleProps}>
                                        <DragHandleIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  )}
                                  <TableCell>{lesson.order}</TableCell>
                                  <TableCell>{lesson.title}</TableCell>
                                  <TableCell>
                                    {lesson.type === 'VIDEO' ?
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <VideoIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                        Video
                                      </Box> :
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <QuizIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                                        Quiz
                                      </Box>}
                                  </TableCell>
                                  <TableCell>
                                    {lesson.type === 'VIDEO' && lesson.videoUrl && (
                                      <Box sx={{ width: 120, height: 68, overflow: 'hidden', borderRadius: 1 }}>
                                        <img
                                          src={`https://img.youtube.com/vi/${getYoutubeVideoId(lesson.videoUrl)}/mqdefault.jpg`}
                                          alt="Video thumbnail"
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          onError={(e) => {
                                            e.target.src = 'https://placehold.co/120x68?text=No+Preview';
                                          }}
                                        />
                                      </Box>
                                    )}
                                    {lesson.type === 'QUIZ' && (
                                      <Typography variant="body2">
                                        {lesson.questions?.length || 0} câu hỏi
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {lesson.type === 'QUIZ' && (
                                      <IconButton
                                        color="secondary"
                                        onClick={() => handleNavigateToQuizManagement(lesson.id)}
                                        title="Quản lý câu hỏi quiz"
                                      >
                                        <QuizIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                    <IconButton
                                      color="primary"
                                      onClick={() => handleOpenEditDialog(lesson)}
                                      title="Chỉnh sửa bài học"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      title="Xóa bài học"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Vui lòng chọn khóa học và chương để quản lý bài học
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn có thể thêm, sửa, xóa và sắp xếp lại thứ tự các bài học sau khi đã chọn chương.
          </Typography>
        </Box>
      )}

      {/* Dialog for Adding/Editing Lesson */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {formMode === 'add' ? 'Thêm bài học mới' : 'Chỉnh sửa bài học'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {selectedCourseName} &gt; {selectedChapterName}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TextField
            fullWidth
            label="Tiêu đề bài học"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            margin="normal"
            required
            error={!lessonTitle.trim()}
            helperText={!lessonTitle.trim() ? "Tiêu đề không được để trống" : ""}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Loại bài học</InputLabel>
            <Select
              value={lessonType}
              onChange={(e) => {
                setLessonType(e.target.value);
                // Reset questions when changing lesson type
                if (e.target.value === 'QUIZ') {
                  setQuestions([{ 
                    questionText: '', 
                    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: true }] 
                  }]);
                }
              }}
              label="Loại bài học"
            >
              <MenuItem value="VIDEO">Video</MenuItem>
              <MenuItem value="QUIZ">Quiz</MenuItem>
            </Select>
          </FormControl>

          {lessonType === 'VIDEO' && (
            <TextField
              fullWidth
              label="URL video YouTube"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              margin="normal"
              required
              error={lessonType === 'VIDEO' && !videoUrl.trim()}
              helperText={
                lessonType === 'VIDEO' && !videoUrl.trim()
                  ? "URL video không được để trống"
                  : "Nhập URL video YouTube (ví dụ: https://www.youtube.com/watch?v=xxxxx)"
              }
            />
          )}

          {lessonType === 'VIDEO' && videoUrl.trim() && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Video preview:
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 320, mx: 'auto', borderRadius: 1, overflow: 'hidden' }}>
                <img
                  src={`https://img.youtube.com/vi/${getYoutubeVideoId(videoUrl)}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  style={{ width: '100%', height: 'auto' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/320x180?text=Invalid+URL';
                  }}
                />
              </Box>
            </Box>
          )}

          {lessonType === 'QUIZ' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Câu hỏi Quiz
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                Lưu ý: Bạn có thể tạo cấu trúc cơ bản của quiz tại đây. 
                Để quản lý chi tiết câu hỏi và đáp án, hãy sử dụng trang quản lý quiz riêng sau khi lưu bài học.
              </Alert>

              {questions.map((question, questionIndex) => (
                <Paper
                  key={questionIndex}
                  elevation={0}
                  sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Câu hỏi {questionIndex + 1}</Typography>
                    
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveQuestion(questionIndex)} 
                      disabled={questions.length === 1}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Nội dung câu hỏi"
                    value={question.questionText}
                    onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
                    variant="outlined"
                    margin="normal"
                    required
                  />
                  
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Các lựa chọn (chọn một đáp án đúng):
                  </Typography>
                  
                  {question.options.map((option, optionIndex) => (
                    <Box
                      key={optionIndex}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center', 
                        mb: 1.5 
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={option.isCorrect}
                            onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                            color="success"
                          />
                        }
                        label=""
                      />
                      <TextField
                        fullWidth
                        label={`Lựa chọn ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionTextChange(questionIndex, optionIndex, e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mx: 1 }}
                        required
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                        disabled={question.options.length <= 2}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  
                  <Button 
                    startIcon={<AddIcon />}
                    onClick={() => handleAddOption(questionIndex)}
                    size="small"
                    sx={{ mt: 1 }}
                    disabled={question.options.length >= 6}
                  >
                    Thêm lựa chọn
                  </Button>
                </Paper>
              ))}
              
              <Button 
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
                sx={{ mt: 1 }}
              >
                Thêm câu hỏi
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            startIcon={formMode === 'add' ? <AddIcon /> : <SaveIcon />}
            disabled={(lessonType === 'VIDEO' && !videoUrl.trim()) || !lessonTitle.trim()}
          >
            {formMode === 'add' ? 'Thêm bài học' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Update PropTypes to make chapterId optional
AdminLessonList.propTypes = {
  initialChapterId: PropTypes.string
};

export default AdminLessonList;