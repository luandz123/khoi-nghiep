import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, TextField, Box, Card, CardContent, 
  IconButton, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Snackbar, Alert, Tabs, Tab
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  VideoLibrary as VideoIcon,
  QuestionAnswer as QuizIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import axiosInstance from '../../utils/axiosConfig';

const AdminLessonList = ({ chapterId }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Phương thức fetchLessons lấy danh sách bài học
  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/lessons/chapter/${chapterId}`);
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setNotification({
        open: true,
        message: 'Không thể tải danh sách bài học. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chapterId) {
      fetchLessons();
    }
  }, [chapterId, fetchLessons]); // Thêm fetchLessons vào dependency array

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAddDialog = () => {
    setFormMode('add');
    setLessonTitle('');
    setLessonType('VIDEO');
    setVideoUrl('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (lesson) => {
    setFormMode('edit');
    setCurrentLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonType(lesson.type);
    setVideoUrl(lesson.videoUrl || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentLesson(null);
  };

  const handleSubmit = async () => {
    try {
      if (formMode === 'add') {
        const newLesson = {
          title: lessonTitle,
          type: lessonType,
          videoUrl: lessonType === 'VIDEO' ? videoUrl : null,
          chapter: { id: chapterId }
        };

        await axiosInstance.post('/lessons', newLesson);
        setNotification({
          open: true,
          message: 'Thêm bài học thành công!',
          severity: 'success'
        });
      } else {
        const updatedLesson = {
          title: lessonTitle,
          type: lessonType,
          videoUrl: lessonType === 'VIDEO' ? videoUrl : null,
          order: currentLesson.order
        };

        await axiosInstance.put(`/lessons/${currentLesson.id}`, updatedLesson);
        setNotification({
          open: true,
          message: 'Cập nhật bài học thành công!',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
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
        message: 'Không thể xóa bài học. Vui lòng thử lại sau.',
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
      await axiosInstance.put('/lessons/reorder', lessonIds);
      setNotification({
        open: true,
        message: 'Thứ tự bài học đã được cập nhật!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error reordering lessons:', error);
      setNotification({
        open: true,
        message: 'Không thể cập nhật thứ tự bài học. Vui lòng thử lại sau.',
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
    
    // Sửa lỗi Unnecessary escape character
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[7].length === 11) ? match[7] : '';
  };

  if (loading && lessons.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Danh sách bài học
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color={reorderMode ? "secondary" : "primary"}
            onClick={toggleReorderMode}
            sx={{ mr: 2 }}
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

      {lessons.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center">Chưa có bài học nào. Bấm "Thêm bài học" để bắt đầu.</Typography>
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
                                    <VideoIcon fontSize="small" sx={{ mr: 1 }} />
                                    Video
                                  </Box> : 
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <QuizIcon fontSize="small" sx={{ mr: 1 }} />
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
                                <IconButton 
                                  color="primary" 
                                  onClick={() => handleOpenEditDialog(lesson)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleDeleteLesson(lesson.id)}
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

      {/* Dialog for Adding/Editing Lesson */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {formMode === 'add' ? 'Thêm bài học mới' : 'Chỉnh sửa bài học'}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 500 }}>
          <TextField
            fullWidth
            label="Tiêu đề bài học"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Loại bài học</InputLabel>
            <Select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
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
              helperText="Nhập URL video YouTube (ví dụ: https://www.youtube.com/watch?v=xxxxx)"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

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
AdminLessonList.propTypes = {
  chapterId: PropTypes.string.isRequired
};

export default AdminLessonList;