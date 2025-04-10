import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Grid, Paper, Stepper, Step, StepLabel,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, Divider,
  Card, CardContent, IconButton, Snackbar, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ChevronRight as NextIcon,
  ChevronLeft as BackIcon,
  Videocam as VideoIcon,  // Add this import
  QuizOutlined as QuizIcon ,
  Image as ImageIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';
import './AdminAddCoursePage.css';

const AdminAddCoursePage = () => {
  const navigate = useNavigate();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Thông tin cơ bản', 'Thiết lập chương học', 'Thêm bài học và quiz', 'Xem trước & Xuất bản'];
  
  // Course form data
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    thumbnail: '', // Vẫn giữ để lưu URL của ảnh đã tải lên
    thumbnailFile: null, // Thêm field này để lưu file ảnh
    thumbnailPreview: '', // Thêm field này để hiển thị preview
    videoUrl: '',
    instructor: '',
    duration: '',
    level: 'BEGINNER',
    categoryId: ''
  });
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Giới hạn kích thước file (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setNotification({
        open: true,
        message: 'Kích thước file không được vượt quá 10MB',
        severity: 'error'
      });
      return;
    }
    
    // Chỉ chấp nhận file ảnh
    if (!file.type.match('image.*')) {
      setNotification({
        open: true,
        message: 'Vui lòng chọn file ảnh',
        severity: 'error'
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCourseData(prevData => ({
        ...prevData,
        thumbnailFile: file,
        thumbnailPreview: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // Chapters data
  const [chapters, setChapters] = useState([
    { title: 'Chương 1: Giới thiệu', description: 'Giới thiệu tổng quan về khóa học', lessons: [] }
  ]);
  
  // Course progress tracking
  const [isPublished, setIsPublished] = useState(false);
  const [courseId, setCourseId] = useState(null);
  
  // UI states
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setNotification({
          open: true,
          message: 'Không thể tải danh mục. Vui lòng thử lại sau.',
          severity: 'error'
        });
      }
    };

    fetchCategories();
  }, []);

  // Handle course form change
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle chapter change
  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = { ...updatedChapters[index], [field]: value };
    setChapters(updatedChapters);
  };

  // Add new chapter
  const addChapter = () => {
    setChapters([
      ...chapters,
      { 
        title: `Chương ${chapters.length + 1}: `, 
        description: '', 
        lessons: [] 
      }
    ]);
  };

  // Remove chapter
  const removeChapter = (index) => {
    if (chapters.length <= 1) {
      setNotification({
        open: true,
        message: 'Khóa học phải có ít nhất một chương!',
        severity: 'warning'
      });
      return;
    }
    
    const updatedChapters = [...chapters];
    updatedChapters.splice(index, 1);
    setChapters(updatedChapters);
  };

  // Add lesson to chapter
  const addLessonToChapter = (chapterIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons.push({
      title: `Bài ${updatedChapters[chapterIndex].lessons.length + 1}: `,
      type: 'VIDEO',
      videoUrl: '',
      content: '',
      order: updatedChapters[chapterIndex].lessons.length + 1
    });
    setChapters(updatedChapters);
  };

  // Add quiz to chapter
  const addQuizToChapter = (chapterIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons.push({
      title: `Quiz ${updatedChapters[chapterIndex].lessons.length + 1}: `,
      type: 'QUIZ',
      questions: [{ questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: true }] }],
      order: updatedChapters[chapterIndex].lessons.length + 1
    });
    setChapters(updatedChapters);
  };

  // Handle lesson change
  const handleLessonChange = (chapterIndex, lessonIndex, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons[lessonIndex] = {
      ...updatedChapters[chapterIndex].lessons[lessonIndex],
      [field]: value
    };
    setChapters(updatedChapters);
  };

  // Remove lesson
  const removeLesson = (chapterIndex, lessonIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons.splice(lessonIndex, 1);
    setChapters(updatedChapters);
  };

  // Add question to quiz
  const addQuestionToQuiz = (chapterIndex, lessonIndex) => {
    const updatedChapters = [...chapters];
    const lesson = updatedChapters[chapterIndex].lessons[lessonIndex];
    
    if (lesson.type === 'QUIZ') {
      lesson.questions.push({
        questionText: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: true }
        ]
      });
      setChapters(updatedChapters);
    }
  };

  // Handle question change
  const handleQuestionChange = (chapterIndex, lessonIndex, questionIndex, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons[lessonIndex].questions[questionIndex][field] = value;
    setChapters(updatedChapters);
  };

  // Handle option change
  const handleOptionChange = (chapterIndex, lessonIndex, questionIndex, optionIndex, field, value) => {
    const updatedChapters = [...chapters];
    const question = updatedChapters[chapterIndex].lessons[lessonIndex].questions[questionIndex];
    
    if (field === 'isCorrect' && value === true) {
      // Unmark other options as correct
      question.options.forEach((option, idx) => {
        option.isCorrect = idx === optionIndex;
      });
    } else {
      question.options[optionIndex][field] = value;
    }
    
    setChapters(updatedChapters);
  };

  // Add option to question
  const addOptionToQuestion = (chapterIndex, lessonIndex, questionIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons[lessonIndex].questions[questionIndex].options.push({
      text: '',
      isCorrect: false
    });
    setChapters(updatedChapters);
  };

  // Remove option from question
  const removeOptionFromQuestion = (chapterIndex, lessonIndex, questionIndex, optionIndex) => {
    const updatedChapters = [...chapters];
    const options = updatedChapters[chapterIndex].lessons[lessonIndex].questions[questionIndex].options;
    
    if (options.length <= 2) {
      setNotification({
        open: true,
        message: 'Mỗi câu hỏi phải có ít nhất hai lựa chọn!',
        severity: 'warning'
      });
      return;
    }
    
    options.splice(optionIndex, 1);
    setChapters(updatedChapters);
  };

  // Validate course data
  const validateCourseData = () => {
    const newErrors = {};
    
    if (!courseData.title.trim()) {
      newErrors.title = 'Tiêu đề khóa học không được để trống';
    }
    
    if (!courseData.description.trim()) {
      newErrors.description = 'Mô tả khóa học không được để trống';
    }
    
    if (!courseData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create course step
  const handleCreateCourse = async () => {
    if (!validateCourseData()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const coursePayload = new FormData();
      coursePayload.append('title', courseData.title);
      coursePayload.append('description', courseData.description);
      coursePayload.append('categoryId', Number(courseData.categoryId));
      coursePayload.append('videoUrl', courseData.videoUrl);
      coursePayload.append('instructor', courseData.instructor);
      coursePayload.append('duration', courseData.duration);
      coursePayload.append('level', courseData.level);
      
      // Thêm file ảnh vào FormData nếu có
      if (courseData.thumbnailFile) {
        coursePayload.append('thumbnail', courseData.thumbnailFile);
      }
      
      const response = await axiosInstance.post('/admin/courses', coursePayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCourseId(response.data.id);
      
      setNotification({
        open: true,
        message: 'Khóa học đã được tạo thành công!',
        severity: 'success'
      });
      
      // Move to next step
      setActiveStep(1);
    } catch (error) {
      console.error('Error creating course:', error);
      setNotification({
        open: true,
        message: 'Không thể tạo khóa học. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create chapters step
  const handleCreateChapters = async () => {
    if (!courseId) {
      setNotification({
        open: true,
        message: 'Vui lòng tạo khóa học trước!',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create chapters one by one to maintain order
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const chapterPayload = {
          title: chapter.title,
          description: chapter.description,
          course: { id: courseId }
        };
        
        const response = await axiosInstance.post('/chapters', chapterPayload);
        // Store chapter ID for lesson creation
        chapters[i].id = response.data.id;
      }
      
      setNotification({
        open: true,
        message: 'Tất cả chương đã được tạo thành công!',
        severity: 'success'
      });
      
      // Move to next step
      setActiveStep(2);
    } catch (error) {
      console.error('Error creating chapters:', error);
      setNotification({
        open: true,
        message: 'Không thể tạo chương học. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

        // Updated handleCreateLessons function
    
    const handleCreateLessons = async () => {
      if (!courseId) {
        setNotification({
          open: true,
          message: 'Vui lòng tạo khóa học trước!',
          severity: 'warning'
        });
        return;
      }
      
      setLoading(true);
      
      try {
        // Process each chapter
        for (const chapter of chapters) {
          if (!chapter.id) {
            continue;
          }
          
          // Create lessons for the chapter
          for (let i = 0; i < chapter.lessons.length; i++) {
            const lesson = chapter.lessons[i];
            
            // Create lesson
            const lessonPayload = {
              title: lesson.title,
              type: lesson.type,
              videoUrl: lesson.type === 'VIDEO' ? lesson.videoUrl : null
            };
            
            // Get a fresh token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('Authentication token not found. Please log in again.');
            }
            
            // Make sure we're using the correct endpoint (note the /api prefix is added by axiosInstance)
            const lessonResponse = await axiosInstance.post(`/lessons/chapter/${chapter.id}`, lessonPayload);
            
            const lessonId = lessonResponse.data.id;
            
            // If it's a quiz, create questions
            if (lesson.type === 'QUIZ' && lesson.questions) {
              for (const question of lesson.questions) {
                // Find the correct answer index
                const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
                const correctAnswer = correctOptionIndex !== -1 ? correctOptionIndex.toString() : '0';
                
                // Format payload to match the backend expectation
                const questionPayload = {
                  questionText: question.questionText,
                  correctAnswer: correctAnswer,
                  options: question.options.map(opt => ({ text: opt.text }))
                };
                
                // Use the correct endpoint (quizzes not quiz)
                await axiosInstance.post(`/quizzes/lesson/${lessonId}/questions`, questionPayload);
              }
            }
          }
        }
        
        setNotification({
          open: true,
          message: 'Tất cả bài học và quiz đã được tạo thành công!',
          severity: 'success'
        });
        
        // Move to final step
        setActiveStep(3);
        setIsPublished(true);
      } catch (error) {
        console.error('Error creating lessons:', error);
        setNotification({
          open: true,
          message: `Không thể tạo bài học: ${error.response?.data?.message || error.message}`,
          severity: 'error'
        });
        
        // If it's a 403 error, suggest logging in again
        if (error.response?.status === 403) {
          setNotification({
            open: true,
            message: 'Phiên làm việc đã hết hạn hoặc bạn không có quyền admin. Vui lòng đăng nhập lại.',
            severity: 'error'
          });
        }
      } finally {
        setLoading(false);
      }
    };
  
  const handlePublishCourse = async () => {
    if (!courseId) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the featured endpoint since there's no dedicated publish endpoint
      await axiosInstance.put(`/admin/courses/${courseId}/featured`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Also update the course details to mark it as published in the title
      const courseDetails = await axiosInstance.get(`/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update the course data
      const updatedCourse = {
        ...courseDetails.data,
        title: courseDetails.data.title.includes('[PUBLISHED]') ? 
          courseDetails.data.title : 
          `[PUBLISHED] ${courseDetails.data.title}`
      };
      
      await axiosInstance.put(`/admin/courses/${courseId}`, updatedCourse, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotification({
        open: true,
        message: 'Khóa học đã được xuất bản thành công!',
        severity: 'success'
      });
      
      // Redirect to course management after short delay
      setTimeout(() => {
        navigate('/admin/courses');
      }, 2000);
    } catch (error) {
      console.error('Error publishing course:', error);
      setNotification({
        open: true,
        message: `Không thể xuất bản khóa học: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0) {
      handleCreateCourse();
    } else if (activeStep === 1) {
      handleCreateChapters();
    } else if (activeStep === 2) {
      handleCreateLessons();
    } else {
      handlePublishCourse();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Thông tin cơ bản khóa học
          </Typography>
          <TextField
            fullWidth
            label="Tiêu đề khóa học"
            name="title"
            value={courseData.title}
            onChange={handleCourseChange}
            margin="normal"
            error={!!errors.title}
            helperText={errors.title}
            required
          />
          <TextField
            fullWidth
            label="Mô tả khóa học"
            name="description"
            value={courseData.description}
            onChange={handleCourseChange}
            margin="normal"
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description}
            required
          />
          <FormControl fullWidth margin="normal" error={!!errors.categoryId} required>
            <InputLabel>Danh mục</InputLabel>
            <Select
              name="categoryId"
              value={courseData.categoryId}
              onChange={handleCourseChange}
              label="Danh mục"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
            {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
          </FormControl>
          <TextField
            fullWidth
            label="Video URL (YouTube)"
            name="videoUrl"
            value={courseData.videoUrl}
            onChange={handleCourseChange}
            margin="normal"
            placeholder="https://www.youtube.com/watch?v=..."
          />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Thông tin bổ sung
          </Typography>
          <TextField
            fullWidth
            label="Giảng viên"
            name="instructor"
            value={courseData.instructor}
            onChange={handleCourseChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Thời lượng"
            name="duration"
            value={courseData.duration}
            onChange={handleCourseChange}
            margin="normal"
            placeholder="Ví dụ: 10 giờ, 8 tuần..."
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Cấp độ</InputLabel>
            <Select
              name="level"
              value={courseData.level}
              onChange={handleCourseChange}
              label="Cấp độ"
            >
              <MenuItem value="BEGINNER">Người mới bắt đầu</MenuItem>
              <MenuItem value="INTERMEDIATE">Trung cấp</MenuItem>
              <MenuItem value="ADVANCED">Nâng cao</MenuItem>
              <MenuItem value="ALL_LEVELS">Tất cả các cấp độ</MenuItem>
            </Select>
          </FormControl>
          {/* Thay đổi từ TextField sang input file upload */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ảnh thumbnail khóa học
            </Typography>
            
            <Button
              variant="contained"
              component="label"
              startIcon={<ImageIcon />}
              sx={{ mb: 2 }}
            >
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnailUpload}
              />
            </Button>
            
            {courseData.thumbnailFile && (
              <Typography variant="caption" display="block">
                File đã chọn: {courseData.thumbnailFile.name}
              </Typography>
            )}
            
            {courseData.thumbnailPreview && (
              <Box mt={2} sx={{ textAlign: 'center' }}>
                <img
            src={courseData.thumbnailPreview}
            alt="Thumbnail preview"
            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Thiết lập chương học</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addChapter}
                >
                  Thêm chương
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={3}>
                Tạo các chương cho khóa học của bạn. Mỗi chương có thể chứa nhiều bài học và quiz.
              </Typography>
              
              {chapters.map((chapter, index) => (
                <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <TextField
                          fullWidth
                          label={`Tiêu đề chương ${index + 1}`}
                          value={chapter.title}
                          onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                          margin="normal"
                          required
                        />
                        <TextField
                          fullWidth
                          label="Mô tả chương"
                          value={chapter.description}
                          onChange={(e) => handleChapterChange(index, 'description', e.target.value)}
                          margin="normal"
                          multiline
                          rows={2}
                        />
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => removeChapter(index)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Paper>
            
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Tiếp theo, bạn sẽ thêm bài học và quiz cho từng chương.
              </Typography>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Thêm bài học và quiz cho: {chapters[currentChapterIndex]?.title || 'Chương'}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addLessonToChapter(currentChapterIndex)}
                    sx={{ mr: 1 }}
                  >
                    Thêm bài học
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => addQuizToChapter(currentChapterIndex)}
                  >
                    Thêm quiz
                  </Button>
                </Box>
              </Box>
              
              <Box display="flex" mb={3}>
                {chapters.map((chapter, index) => (
                  <Button
                    key={index}
                    variant={currentChapterIndex === index ? "contained" : "outlined"}
                    onClick={() => setCurrentChapterIndex(index)}
                    sx={{ mr: 1 }}
                  >
                    Chương {index + 1}
                  </Button>
                ))}
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={3}>
                Thêm bài học video hoặc quiz cho chương này. Đối với mỗi quiz, bạn có thể thêm nhiều câu hỏi.
              </Typography>
              
              {chapters[currentChapterIndex]?.lessons.map((lesson, lessonIndex) => (
                <Card key={lessonIndex} sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        {lesson.type === 'VIDEO' ? (
                          <VideoIcon color="primary" sx={{ mr: 1 }} />
                        ) : (
                          <QuizIcon color="secondary" sx={{ mr: 1 }} />
                        )}
                        <Typography variant="subtitle1">
                          {lesson.type === 'VIDEO' ? 'Bài học Video' : 'Quiz'}
                        </Typography>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => removeLesson(currentChapterIndex, lessonIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="Tiêu đề"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(currentChapterIndex, lessonIndex, 'title', e.target.value)}
                      margin="normal"
                      required
                    />
                    
                    {lesson.type === 'VIDEO' ? (
                      <TextField
                        fullWidth
                        label="URL Video (YouTube)"
                        value={lesson.videoUrl || ''}
                        onChange={(e) => handleLessonChange(currentChapterIndex, lessonIndex, 'videoUrl', e.target.value)}
                        margin="normal"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                      />
                    ) : (
                      <Box mt={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle2">Câu hỏi Quiz</Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => addQuestionToQuiz(currentChapterIndex, lessonIndex)}
                          >
                            Thêm câu hỏi
                          </Button>
                        </Box>
                        
                        {lesson.questions?.map((question, questionIndex) => (
                          <Card key={questionIndex} variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <TextField
                              fullWidth
                              label={`Câu hỏi ${questionIndex + 1}`}
                              value={question.questionText}
                              onChange={(e) => handleQuestionChange(currentChapterIndex, lessonIndex, questionIndex, 'questionText', e.target.value)}
                              margin="normal"
                              required
                            />
                            
                            <Typography variant="subtitle2" mt={2} mb={1}>
                              Các lựa chọn (đánh dấu đáp án đúng):
                            </Typography>
                            
                            {question.options.map((option, optionIndex) => (
                              <Box key={optionIndex} display="flex" alignItems="center" mb={1}>
                                <FormControl component="fieldset">
                                  <input
                                    type="radio"
                                    checked={option.isCorrect}
                                    onChange={() => handleOptionChange(currentChapterIndex, lessonIndex, questionIndex, optionIndex, 'isCorrect', true)}
                                  />
                                </FormControl>
                                <TextField
                                  fullWidth
                                  label={`Lựa chọn ${optionIndex + 1}`}
                                  value={option.text}
                                  onChange={(e) => handleOptionChange(currentChapterIndex, lessonIndex, questionIndex, optionIndex, 'text', e.target.value)}
                                  margin="dense"
                                  size="small"
                                  required
                                  sx={{ ml: 1, mr: 1 }}
                                />
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeOptionFromQuestion(currentChapterIndex, lessonIndex, questionIndex, optionIndex)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                            
                            <Button
                              size="small"
                              onClick={() => addOptionToQuestion(currentChapterIndex, lessonIndex, questionIndex)}
                              sx={{ mt: 1 }}
                            >
                              Thêm lựa chọn
                            </Button>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {chapters[currentChapterIndex]?.lessons.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    Chưa có bài học hoặc quiz nào. Thêm bài học hoặc quiz để tiếp tục.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box textAlign="center" mb={3}>
                <SchoolIcon color="primary" sx={{ fontSize: 60 }} />
                <Typography variant="h5" gutterBottom mt={2}>
                  Khóa học đã sẵn sàng!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Khóa học "{courseData.title}" đã được tạo thành công với {chapters.length} chương và 
                  {chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} bài học.
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tổng quan khóa học
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Box className="course-preview-image">
                      {courseData.thumbnail ? (
                        <img
                          src={courseData.thumbnail}
                          alt={courseData.title}
                          style={{ width: '100%', borderRadius: 8 }}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            bgcolor: 'grey.200', 
                            height: 200, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: 2
                          }}
                        >
                          <ImageIcon color="disabled" sx={{ fontSize: 40 }} />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {courseData.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {courseData.description}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <Typography variant="body2">
                        <b>Giảng viên:</b> {courseData.instructor || 'Chưa có thông tin'}
                      </Typography>
                      <Typography variant="body2">
                        <b>Thời lượng:</b> {courseData.duration || 'Chưa có thông tin'}
                      </Typography>
                      <Typography variant="body2">
                        <b>Cấp độ:</b> {
                          courseData.level === 'BEGINNER' ? 'Người mới bắt đầu' :
                          courseData.level === 'INTERMEDIATE' ? 'Trung cấp' :
                          courseData.level === 'ADVANCED' ? 'Nâng cao' : 'Tất cả các cấp độ'
                        }
                      </Typography>
                      <Typography variant="body2">
                        <b>Danh mục:</b> {categories.find(c => c.id.toString() === courseData.categoryId.toString())?.name || 'Chưa có thông tin'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom>
                  Nội dung khóa học
                </Typography>
                
                {chapters.map((chapter, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {chapter.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {chapter.description}
                      </Typography>
                      
                      <Box sx={{ pl: 2 }}>
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <Box key={lessonIndex} display="flex" alignItems="center" py={0.5}>
                            {lesson.type === 'VIDEO' ? (
                              <VideoIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                            ) : (
                              <QuizIcon fontSize="small" color="secondary" sx={{ mr: 1 }} />
                            )}
                            <Typography variant="body2">
                              {lesson.title} {lesson.type === 'QUIZ' && `(${lesson.questions?.length || 0} câu hỏi)`}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
            
            <Box textAlign="center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handlePublishCourse}
                disabled={loading || !isPublished}
              >
                Xuất bản khóa học
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Tạo khóa học mới
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent()}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<BackIcon />}
          disabled={activeStep === 0 || loading}
        >
          Quay lại
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={activeStep < steps.length - 1 ? <NextIcon /> : <SaveIcon />}
          disabled={loading}
        >
          {activeStep === steps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
        </Button>
      </Box>
      
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

export default AdminAddCoursePage;