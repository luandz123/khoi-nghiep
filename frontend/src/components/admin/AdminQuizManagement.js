import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Divider, Button, TextField, FormControl, 
   Radio, IconButton, Grid, Card, CardContent,
  Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, 
  Alert, Snackbar, CircularProgress, Select, MenuItem, InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  QuestionAnswer as QuizIcon,
  List as ListIcon
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';

const AdminQuizManagement = () => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: true }
  ]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch initial data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get('/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setNotification({
          open: true,
          message: 'Không thể tải danh sách khóa học.',
          severity: 'error'
        });
      }
    };

    fetchCourses();
    setLoading(false);
  }, []);

  // Fetch chapters when course changes
  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      const fetchChapters = async () => {
        try {
          const response = await axiosInstance.get(`/chapters/course/${selectedCourse}`);
          setChapters(response.data);
          setSelectedChapter('');
          setSelectedLesson('');
        } catch (error) {
          console.error('Error fetching chapters:', error);
          setNotification({
            open: true,
            message: 'Không thể tải danh sách chương học.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };

      fetchChapters();
    } else {
      setChapters([]);
      setSelectedChapter('');
    }
  }, [selectedCourse]);

  // Fetch lessons when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      setLoading(true);
      const fetchLessons = async () => {
        try {
          const response = await axiosInstance.get(`/lessons/chapter/${selectedChapter}`);
          // Filter to only quiz type lessons
          const quizLessons = response.data.filter(lesson => lesson.type === 'QUIZ');
          setLessons(quizLessons);
          setSelectedLesson('');
        } catch (error) {
          console.error('Error fetching lessons:', error);
          setNotification({
            open: true,
            message: 'Không thể tải danh sách bài học.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };

      fetchLessons();
    } else {
      setLessons([]);
      setSelectedLesson('');
    }
  }, [selectedChapter]);

  // Fetch quiz questions when lesson changes
  useEffect(() => {
    if (selectedLesson) {
      setLoading(true);
      const fetchQuizQuestions = async () => {
        try {
          const response = await axiosInstance.get(`/quiz/questions/${selectedLesson}`);
          setQuizzes(response.data);
        } catch (error) {
          console.error('Error fetching quiz questions:', error);
          setNotification({
            open: true,
            message: 'Không thể tải câu hỏi quiz.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };

      fetchQuizQuestions();
    } else {
      setQuizzes([]);
    }
  }, [selectedLesson]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleChapterChange = (event) => {
    setSelectedChapter(event.target.value);
  };

  const handleLessonChange = (event) => {
    setSelectedLesson(event.target.value);
  };

  const handleOpenAddQuizDialog = () => {
    setCurrentQuestion(null);
    setQuestionText('');
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: true }
    ]);
    setOpenQuizDialog(true);
  };

  const handleOpenEditQuizDialog = (question) => {
    setCurrentQuestion(question);
    setQuestionText(question.questionText);
    
    // Parse options from the question
    const questionOptions = question.options.map(option => {
      return {
        text: option.text,
        isCorrect: question.correctAnswer === option.id.toString()
      };
    });
    
    setOptions(questionOptions);
    setOpenQuizDialog(true);
  };

  const handleCloseQuizDialog = () => {
    setOpenQuizDialog(false);
    setCurrentQuestion(null);
  };

  const handleQuestionTextChange = (e) => {
    setQuestionText(e.target.value);
  };

  const handleOptionTextChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleOptionCorrectChange = (index) => {
    const newOptions = [...options];
    newOptions.forEach((option, i) => {
      option.isCorrect = i === index;
    });
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }]);
    } else {
      setNotification({
        open: true,
        message: 'Tối đa 6 lựa chọn cho mỗi câu hỏi.',
        severity: 'warning'
      });
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      
      // If we removed the correct option, make the first one correct
      if (newOptions.every(option => !option.isCorrect)) {
        newOptions[0].isCorrect = true;
      }
      
      setOptions(newOptions);
    } else {
      setNotification({
        open: true,
        message: 'Cần ít nhất 2 lựa chọn cho mỗi câu hỏi.',
        severity: 'warning'
      });
    }
  };

  const validateQuizForm = () => {
    if (!questionText.trim()) {
      setNotification({
        open: true,
        message: 'Vui lòng nhập nội dung câu hỏi.',
        severity: 'warning'
      });
      return false;
    }

    if (options.some(option => !option.text.trim())) {
      setNotification({
        open: true,
        message: 'Vui lòng nhập nội dung cho tất cả các lựa chọn.',
        severity: 'warning'
      });
      return false;
    }

    if (!options.some(option => option.isCorrect)) {
      setNotification({
        open: true,
        message: 'Vui lòng chọn ít nhất một đáp án đúng.',
        severity: 'warning'
      });
      return false;
    }

    return true;
  };

  const handleSaveQuestion = async () => {
    if (!validateQuizForm()) return;
    
    try {
      setLoading(true);
      
      // Find the correct answer index
      const correctOptionIndex = options.findIndex(opt => opt.isCorrect);
      
      if (currentQuestion) {
        // Update existing question
        await axiosInstance.put(`/quiz/questions/${currentQuestion.id}`, {
          question: {
            questionText: questionText,
            correctAnswer: correctOptionIndex.toString()
          },
          options: options.map(opt => ({ text: opt.text }))
        });
        
        setNotification({
          open: true,
          message: 'Cập nhật câu hỏi thành công!',
          severity: 'success'
        });
      } else {
        // Create new question
        await axiosInstance.post(`/quiz/questions/${selectedLesson}`, {
          question: {
            questionText: questionText,
            correctAnswer: correctOptionIndex.toString()
          },
          options: options.map(opt => ({ text: opt.text }))
        });
        
        setNotification({
          open: true,
          message: 'Thêm câu hỏi mới thành công!',
          severity: 'success'
        });
      }
      
      // Reload questions
      const response = await axiosInstance.get(`/quiz/questions/${selectedLesson}`);
      setQuizzes(response.data);
      
      handleCloseQuizDialog();
    } catch (error) {
      console.error('Error saving question:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi lưu câu hỏi. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/quiz/questions/${questionId}`);
      
      setNotification({
        open: true,
        message: 'Xóa câu hỏi thành công!',
        severity: 'success'
      });
      
      // Reload questions
      const response = await axiosInstance.get(`/quiz/questions/${selectedLesson}`);
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error deleting question:', error);
      setNotification({
        open: true,
        message: 'Lỗi khi xóa câu hỏi. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý Quiz
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Quản lý Câu hỏi Quiz" icon={<QuizIcon />} />
          <Tab label="Báo cáo & Thống kê" icon={<ListIcon />} disabled />
        </Tabs>
        
        {tabValue === 0 && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="course-select-label">Chọn khóa học</InputLabel>
                  <Select
                    labelId="course-select-label"
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    label="Chọn khóa học"
                  >
                    <MenuItem value="">
                      <em>Chọn khóa học</em>
                    </MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!selectedCourse}>
                  <InputLabel id="chapter-select-label">Chọn chương</InputLabel>
                  <Select
                    labelId="chapter-select-label"
                    value={selectedChapter}
                    onChange={handleChapterChange}
                    label="Chọn chương"
                  >
                    <MenuItem value="">
                      <em>Chọn chương</em>
                    </MenuItem>
                    {chapters.map((chapter) => (
                      <MenuItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!selectedChapter}>
                  <InputLabel id="lesson-select-label">Chọn bài quiz</InputLabel>
                  <Select
                    labelId="lesson-select-label"
                    value={selectedLesson}
                    onChange={handleLessonChange}
                    label="Chọn bài quiz"
                  >
                    <MenuItem value="">
                      <em>Chọn bài quiz</em>
                    </MenuItem>
                    {lessons.map((lesson) => (
                      <MenuItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {selectedLesson && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Danh sách câu hỏi
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddQuizDialog}
                >
                  Thêm câu hỏi
                </Button>
              </Box>
            )}
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {!selectedLesson ? (
                  <Alert severity="info">
                    Vui lòng chọn khóa học, chương và bài quiz để xem và quản lý các câu hỏi.
                  </Alert>
                ) : quizzes.length === 0 ? (
                  <Alert severity="info">
                    Chưa có câu hỏi nào cho bài quiz này. Hãy thêm câu hỏi mới.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {quizzes.map((question, index) => (
                      <Grid item xs={12} key={question.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Typography variant="subtitle1" fontWeight="bold">
                                Câu {index + 1}: {question.questionText}
                              </Typography>
                              <Box>
                                <IconButton color="primary" onClick={() => handleOpenEditQuizDialog(question)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDeleteQuestion(question.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Grid container spacing={2}>
                              {question.options.map((option) => (
                                <Grid item xs={12} sm={6} key={option.id}>
                                  <Box 
                                    sx={{ 
                                      p: 2, 
                                      borderRadius: 1, 
                                      bgcolor: question.correctAnswer === option.id.toString() ? 'success.light' : 'grey.100',
                                      color: question.correctAnswer === option.id.toString() ? 'success.dark' : 'text.primary'
                                    }}
                                  >
                                    {option.text}
                                    {question.correctAnswer === option.id.toString() && (
                                      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                        (Đáp án đúng)
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </>
        )}
      </Paper>
      
      {/* Quiz Question Dialog */}
      <Dialog open={openQuizDialog} onClose={handleCloseQuizDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {currentQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Câu hỏi"
            value={questionText}
            onChange={handleQuestionTextChange}
            margin="normal"
            required
          />
          
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Các lựa chọn
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Chọn một đáp án đúng bằng cách click vào radio button.
            </Typography>
          </Box>
          
          {options.map((option, index) => (
            <Box key={index} display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Radio
                checked={option.isCorrect}
                onChange={() => handleOptionCorrectChange(index)}
                color="success"
              />
              <TextField
                fullWidth
                label={`Lựa chọn ${index + 1}`}
                value={option.text}
                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                margin="dense"
                sx={{ mx: 1 }}
                required
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveOption(index)}
                disabled={options.length <= 2}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddOption}
            disabled={options.length >= 6}
            sx={{ mt: 1 }}
          >
            Thêm lựa chọn
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuizDialog} startIcon={<CancelIcon />}>
            Hủy
          </Button>
          <Button 
            onClick={handleSaveQuestion} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
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

export default AdminQuizManagement;