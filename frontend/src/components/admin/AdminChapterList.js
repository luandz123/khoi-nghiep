import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, TextField, Box, Card, CardContent, 
  IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
  Paper, Divider, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

const AdminChapterList = ({ courseId }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChapter, setEditingChapter] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDescription, setNewChapterDescription] = useState('');
  const [reorderMode, setReorderMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/chapters/course/${courseId}`);
      setChapters(response.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setNotification({
        open: true,
        message: 'Không thể tải danh sách chương. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) {
      setNotification({
        open: true,
        message: 'Vui lòng nhập tiêu đề chương.',
        severity: 'warning'
      });
      return;
    }

    try {
      const newChapter = {
        title: newChapterTitle,
        description: newChapterDescription,
        course: { id: courseId }
      };

      await axiosInstance.post('/chapters', newChapter);
      setNewChapterTitle('');
      setNewChapterDescription('');
      setNotification({
        open: true,
        message: 'Thêm chương mới thành công!',
        severity: 'success'
      });
      fetchChapters();
    } catch (error) {
      console.error('Error creating chapter:', error);
      setNotification({
        open: true,
        message: 'Không thể thêm chương mới. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter || !newChapterTitle.trim()) {
      setNotification({
        open: true,
        message: 'Vui lòng nhập tiêu đề chương.',
        severity: 'warning'
      });
      return;
    }

    try {
      const updatedChapter = {
        title: newChapterTitle,
        description: newChapterDescription
      };

      await axiosInstance.put(`/chapters/${editingChapter.id}`, updatedChapter);
      setEditingChapter(null);
      setNewChapterTitle('');
      setNewChapterDescription('');
      setNotification({
        open: true,
        message: 'Cập nhật chương thành công!',
        severity: 'success'
      });
      fetchChapters();
    } catch (error) {
      console.error('Error updating chapter:', error);
      setNotification({
        open: true,
        message: 'Không thể cập nhật chương. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này? Tất cả bài học trong chương cũng sẽ bị xóa.')) return;

    try {
      await axiosInstance.delete(`/chapters/${chapterId}`);
      setNotification({
        open: true,
        message: 'Xóa chương thành công!',
        severity: 'success'
      });
      fetchChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setNotification({
        open: true,
        message: 'Không thể xóa chương. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
  };

  const handleStartEditing = (chapter) => {
    setEditingChapter(chapter);
    setNewChapterTitle(chapter.title);
    setNewChapterDescription(chapter.description || '');
  };

  const handleCancelEditing = () => {
    setEditingChapter(null);
    setNewChapterTitle('');
    setNewChapterDescription('');
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    const reorderedChapters = Array.from(chapters);
    const [removed] = reorderedChapters.splice(startIndex, 1);
    reorderedChapters.splice(endIndex, 0, removed);

    setChapters(reorderedChapters);

    try {
      const chapterIds = reorderedChapters.map(chapter => chapter.id);
      await axiosInstance.put('/chapters/reorder', chapterIds);
      setNotification({
        open: true,
        message: 'Thứ tự các chương đã được cập nhật!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error reordering chapters:', error);
      setNotification({
        open: true,
        message: 'Không thể cập nhật thứ tự chương. Vui lòng thử lại sau.',
        severity: 'error'
      });
      fetchChapters(); // Tải lại thứ tự ban đầu
    }
  };

  const toggleReorderMode = () => {
    setReorderMode(!reorderMode);
  };

  const handleManageLessons = (chapterId) => {
    navigate(`/admin/lessons/${chapterId}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading && chapters.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
    // Update the handleCreateLessons function
    // Replace the handleCreateLessons function
  
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
      // Get a fresh token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      // Process each chapter
      for (const chapter of chapters) {
        if (!chapter.id) {
          console.warn(`Chapter without ID found, skipping: ${chapter.title}`);
          continue;
        }
        
        console.log(`Creating lessons for chapter ID ${chapter.id}`);
        
        // Create lessons for this chapter
        for (let i = 0; i < chapter.lessons.length; i++) {
          const lesson = chapter.lessons[i];
          
          // Create lesson
          const lessonPayload = {
            title: lesson.title,
            type: lesson.type,
            videoUrl: lesson.type === 'VIDEO' ? lesson.videoUrl : null
          };
          
          console.log(`Creating lesson: ${lesson.title}, type: ${lesson.type}`);
          
          // Use explicit token in request headers
          const lessonResponse = await axiosInstance.post(`/lessons/chapter/${chapter.id}`, lessonPayload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const lessonId = lessonResponse.data.id;
          console.log(`Lesson created with ID: ${lessonId}`);
          
          // If it's a quiz, create questions
          if (lesson.type === 'QUIZ' && lesson.questions && lesson.questions.length > 0) {
            console.log(`Creating ${lesson.questions.length} questions for quiz`);
            
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
              
              // Use the correct endpoint with explicit token
              await axiosInstance.post(`/quizzes/lesson/${lessonId}/questions`, questionPayload, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log(`Created question: ${question.questionText}`);
            }
          }
        }
      }
            // Replace the handlePublishCourse function
      
      const handlePublishCourse = async () => {
        if (!courseId) {
          setNotification({
            open: true,
            message: 'Không tìm thấy ID khóa học!',
            severity: 'error'
          });
          return;
        }
        
        setLoading(true);
        
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          }
          
          // Use the featured endpoint since there's no dedicated publish endpoint
          await axiosInstance.put(`/admin/courses/${courseId}/featured`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Also update the course details to mark it as published in the title
          const courseDetails = await axiosInstance.get(`/admin/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
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
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
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
          
          let errorMessage = 'Không thể xuất bản khóa học.';
          
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = `Lỗi: ${error.response.data.message}`;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setNotification({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };
      
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
      
      let errorMessage = 'Không thể tạo bài học.';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại với tài khoản admin.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = `Lỗi: ${error.response.data.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Quản lý chương
        </Typography>
        {chapters.length > 0 && (
          <Button 
            variant="outlined" 
            color={reorderMode ? "secondary" : "primary"}
            onClick={toggleReorderMode}
          >
            {reorderMode ? "Thoát sắp xếp" : "Sắp xếp lại"}
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
        </Typography>
        <TextField
          fullWidth
          label="Tiêu đề chương"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Mô tả chương (tùy chọn)"
          value={newChapterDescription}
          onChange={(e) => setNewChapterDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          {editingChapter && (
            <Button 
              variant="outlined" 
              onClick={handleCancelEditing}
              sx={{ mr: 1 }}
            >
              Hủy
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={editingChapter ? <EditIcon /> : <AddIcon />}
            onClick={editingChapter ? handleUpdateChapter : handleCreateChapter}
          >
            {editingChapter ? 'Cập nhật' : 'Thêm chương'}
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Danh sách chương
      </Typography>

      {chapters.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center">Chưa có chương nào. Bạn có thể thêm chương mới ở trên.</Typography>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="chapters" isDropDisabled={!reorderMode}>
            {(provided) => (
              <List 
                sx={{ 
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {chapters.map((chapter, index) => (
                  <Draggable 
                    key={chapter.id} 
                    draggableId={chapter.id.toString()} 
                    index={index}
                    isDragDisabled={!reorderMode}
                  >
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ 
                          borderBottom: index < chapters.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                          cursor: reorderMode ? 'move' : 'default'
                        }}
                      >
                        {reorderMode && (
                          <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                            <DragHandleIcon />
                          </Box>
                        )}
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" component="div">
                              {chapter.order}. {chapter.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" component="div">
                                {chapter.description || 'Không có mô tả'}
                              </Typography>
                              <Typography variant="body2" color="primary" component="div">
                                {chapter.lessonsCount} bài học
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end" 
                            color="secondary"
                            onClick={() => handleManageLessons(chapter.id)}
                            title="Quản lý bài học"
                            sx={{ mr: 1 }}
                          >
                            <MenuBookIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            color="primary"
                            onClick={() => handleStartEditing(chapter)}
                            title="Chỉnh sửa chương"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            color="error"
                            onClick={() => handleDeleteChapter(chapter.id)}
                            title="Xóa chương"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

// Thêm PropTypes validation
AdminChapterList.propTypes = {
  courseId: PropTypes.string.isRequired
};

export default AdminChapterList;