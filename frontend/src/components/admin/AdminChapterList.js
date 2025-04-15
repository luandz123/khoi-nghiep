import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  DragHandle as DragHandleIcon,
  School as SchoolIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axiosInstance from '../../utils/axiosConfig';

const AdminChapterList = ({ initialCourseId }) => {
  // States
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || '');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [editingChapter, setEditingChapter] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDescription, setNewChapterDescription] = useState('');
  const [reorderMode, setReorderMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [reorderedChapters, setReorderedChapters] = useState([]);
  const navigate = useNavigate();

  // Fetch all courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await axiosInstance.get('/admin/courses');
        setCourses(response.data);
        
        // If initialCourseId is provided and exists in the fetched courses, set the course name
        if (initialCourseId) {
          const course = response.data.find(c => c.id.toString() === initialCourseId.toString());
          if (course) {
            setSelectedCourseName(course.title);
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
  }, [initialCourseId]);

  // Fetch chapters when selected course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetchChapters(selectedCourseId);
    } else {
      setChapters([]);
      setLoading(false);
    }
  }, [selectedCourseId]);

  const fetchChapters = async (courseId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/chapters/course/${courseId}`);
      // Ensure chapters are sorted by order
      const sortedChapters = response.data.sort((a, b) => a.order - b.order);
      setChapters(sortedChapters);
      setReorderedChapters(sortedChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setNotification({
        open: true,
        message: `Lỗi khi tải danh sách chương: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
      setChapters([]);
      setReorderedChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);
    
    // Update selected course name for display
    if (courseId) {
      const course = courses.find(c => c.id.toString() === courseId.toString());
      if (course) {
        setSelectedCourseName(course.title);
      }
    } else {
      setSelectedCourseName('');
    }
    
    // Reset chapter editing state
    setEditingChapter(null);
    setNewChapterTitle('');
    setNewChapterDescription('');
    setReorderMode(false);
  };

  const handleOpenDialog = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setNewChapterTitle(chapter.title);
      setNewChapterDescription(chapter.description || '');
    } else {
      setEditingChapter(null);
      setNewChapterTitle('');
      setNewChapterDescription('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingChapter(null);
    setNewChapterTitle('');
    setNewChapterDescription('');
  };

  const handleCreateChapter = async () => {
    if (!selectedCourseId) {
      setNotification({
        open: true,
        message: 'Vui lòng chọn một khóa học trước khi thêm chương.',
        severity: 'warning'
      });
      return;
    }

    if (!newChapterTitle.trim()) {
      setNotification({
        open: true,
        message: 'Tiêu đề chương không được để trống!',
        severity: 'warning'
      });
      return;
    }

    try {
      const chapterPayload = {
        title: newChapterTitle,
        description: newChapterDescription,
        course: { id: parseInt(selectedCourseId) }
      };

      const response = await axiosInstance.post('/chapters', chapterPayload);
      setChapters([...chapters, response.data]);
      setReorderedChapters([...reorderedChapters, response.data]);
      
      setNotification({
        open: true,
        message: 'Thêm chương mới thành công!',
        severity: 'success'
      });
      
      // Close dialog and reset form
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating chapter:', error);
      setNotification({
        open: true,
        message: `Lỗi khi tạo chương: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter || !newChapterTitle.trim()) {
      setNotification({
        open: true,
        message: 'Tiêu đề chương không được để trống!',
        severity: 'warning'
      });
      return;
    }

    try {
      const chapterPayload = {
        title: newChapterTitle,
        description: newChapterDescription,
        order: editingChapter.order
      };

      const response = await axiosInstance.put(`/chapters/${editingChapter.id}`, chapterPayload);
      
      // Update chapters list
      const updatedChapters = chapters.map(chapter => 
        chapter.id === editingChapter.id ? response.data : chapter
      );
      setChapters(updatedChapters);
      setReorderedChapters(updatedChapters);
      
      setNotification({
        open: true,
        message: 'Cập nhật chương thành công!',
        severity: 'success'
      });
      
      // Close dialog and reset form
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating chapter:', error);
      setNotification({
        open: true,
        message: `Lỗi khi cập nhật chương: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này? Tất cả bài học trong chương cũng sẽ bị xóa.')) {
      return;
    }

    try {
      await axiosInstance.delete(`/chapters/${chapterId}`);
      
      // Remove chapter from lists
      const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
      setChapters(updatedChapters);
      setReorderedChapters(updatedChapters);
      
      setNotification({
        open: true,
        message: 'Xóa chương thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setNotification({
        open: true,
        message: `Lỗi khi xóa chương: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) {
      return;
    }

    const items = Array.from(reorderedChapters);
    const [removed] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, removed);

    // Update the order property for each chapter
    const updatedItems = items.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }));

    setReorderedChapters(updatedItems);
  };

  const saveReorderedChapters = async () => {
    setSavingOrder(true);
    try {
      // Update the chapters list in the UI immediately
      setChapters(reorderedChapters);
      
      // Get chapter IDs in new order
      const chapterIds = reorderedChapters.map(chapter => chapter.id);
      
      // Call API to update order in backend
      await axiosInstance.put('/chapters/reorder', chapterIds);
      
      setNotification({
        open: true,
        message: 'Sắp xếp lại chương thành công!',
        severity: 'success'
      });
      
      // Exit reorder mode
      setReorderMode(false);
    } catch (error) {
      console.error('Error reordering chapters:', error);
      
      // Revert to original order if there's an error
      fetchChapters(selectedCourseId);
      
      setNotification({
        open: true,
        message: `Lỗi khi sắp xếp lại chương: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setSavingOrder(false);
    }
  };

  const toggleReorderMode = () => {
    const newMode = !reorderMode;
    setReorderMode(newMode);
    
    // Reset reordered chapters to match current chapters when entering reorder mode
    if (newMode) {
      setReorderedChapters([...chapters]);
    }
  };

  const handleManageLessons = (chapterId) => {
    navigate(`/admin/lessons/${chapterId}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý chương khóa học
      </Typography>

      {/* Course selection */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chọn khóa học
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="course-select-label">Khóa học</InputLabel>
            <Select
          labelId="course-select-label"
          value={selectedCourseId}
          onChange={handleCourseChange}
          label="Khóa học"
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
        </Paper>

        {selectedCourseId && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2">
              {selectedCourseName}
            </Typography>
          </Box>
          <Box>
            {reorderMode && (
              <Button
            variant="contained"
            color="primary"
            onClick={saveReorderedChapters}
            disabled={savingOrder}
            startIcon={<SaveIcon />}
            sx={{ mr: 2 }}
              >
            {savingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
              </Button>
            )}
            {chapters.length > 0 && (
              <Button 
            variant="outlined" 
            color={reorderMode ? "secondary" : "primary"}
            onClick={toggleReorderMode}
              >
            {reorderMode ? "Thoát sắp xếp" : "Sắp xếp lại chương"}
              </Button>
            )}
          </Box>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Danh sách chương ({chapters.length})
          </Typography>
          {loading && <CircularProgress size={24} />}
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : chapters.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Chưa có chương nào cho khóa học này. Hãy thêm chương mới.
            </Typography>
              </CardContent>
            </Card>
          ) : (
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
              {(reorderMode ? reorderedChapters : chapters).map((chapter, index) => (
                <Draggable
              key={chapter.id}
              draggableId={chapter.id.toString()}
              index={index}
              isDragDisabled={!reorderMode}
                >
              {(providedDraggable) => (
                <ListItem
                  ref={providedDraggable.innerRef}
                  {...providedDraggable.draggableProps}
                  sx={{
                borderBottom: index < chapters.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                cursor: reorderMode ? 'move' : 'default',
                py: 2,
                bgcolor: reorderMode ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                  }}
                >
                  {reorderMode && (
                <Box {...providedDraggable.dragHandleProps} sx={{ mr: 2, color: 'text.secondary' }}>
                  <DragHandleIcon />
                </Box>
                  )}
                  <ListItemText
                primary={
                  <Typography variant="subtitle1" component="div">
                    {reorderMode ? `${index + 1}.` : `${chapter.order}.`} {chapter.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary" component="div">
                  {chapter.description || 'Không có mô tả'}
                    </Typography>
                    <Typography variant="body2" color="primary" component="div" sx={{ mt: 0.5 }}>
                  {chapter.lessonsCount || 0} bài học • {chapter.completedLessons || 0} đã hoàn thành
                    </Typography>
                  </>
                }
                  />
                  {!reorderMode && (
                <ListItemSecondaryAction>
                  <Tooltip title="Quản lý bài học">
                    <IconButton
                  color="secondary"
                  onClick={() => handleManageLessons(chapter.id)}
                  sx={{ mr: 1 }}
                    >
                  <MenuBookIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa chương">
                    <IconButton 
                  color="primary"
                  onClick={() => handleOpenDialog(chapter)}
                  sx={{ mr: 1 }}
                    >
                  <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa chương">
                    <IconButton 
                  color="error"
                  onClick={() => handleDeleteChapter(chapter.id)}
                    >
                  <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
                  )}
                </ListItem>
              )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
              )}
            </Droppable>
          )}
            </DragDropContext>

            {/* Floating Action Button for adding new chapter */}
          {!reorderMode && (
            <Tooltip title="Thêm chương mới">
              <Fab
                color="primary"
                aria-label="add"
                onClick={() => handleOpenDialog()}
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          )}
        </>
      )}

      {!selectedCourseId && !loadingCourses && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vui lòng chọn một khóa học để quản lý các chương.
          </Typography>
        </Box>
      )}

      {/* Dialog for creating/editing chapters */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tiêu đề chương"
            type="text"
            fullWidth
            variant="outlined"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            required
            placeholder="Ví dụ: Chương 1: Giới thiệu"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Mô tả chương"
            type="text"
            fullWidth
            variant="outlined"
            value={newChapterDescription}
            onChange={(e) => setNewChapterDescription(e.target.value)}
            multiline
            rows={4}
            placeholder="Mô tả nội dung chính của chương này"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={editingChapter ? handleUpdateChapter : handleCreateChapter}
            variant="contained" 
            color="primary"
            startIcon={editingChapter ? <EditIcon /> : <AddIcon />}
          >
            {editingChapter ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

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
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

// Cập nhật PropTypes để initialCourseId là optional
AdminChapterList.propTypes = {
  initialCourseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default AdminChapterList;