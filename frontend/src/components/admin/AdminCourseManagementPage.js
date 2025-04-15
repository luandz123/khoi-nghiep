import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, CircularProgress,
  Alert, TablePagination, Tooltip, InputAdornment, Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import './AdminCourseManagementPage.css';

const AdminCourseManagementPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({
    id: null,
    title: '',
    description: '',
    thumbnail: '',
    thumbnailFile: null, // Thêm để lưu file ảnh
    thumbnailPreview: '', // Thêm để hiển thị preview
    videoUrl: '',
    categoryId: '',
    duration: '',
    level: 'BEGINNER',
    instructor: '',
    featured: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  // Lấy dữ liệu khóa học và danh mục
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesResponse, categoriesResponse] = await Promise.all([
          axiosInstance.get('/admin/courses'),
          axiosInstance.get('/categories')
        ]);
        setCourses(coursesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý phân trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Tìm kiếm khóa học
  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lấy tên danh mục
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  // Xử lý upload thumbnail
const handleThumbnailUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Giới hạn kích thước file (10MB)
  if (file.size > 10 * 1024 * 1024) {
    setDialogError('Kích thước file không được vượt quá 10MB');
    return;
  }
  
  // Chỉ chấp nhận file ảnh
  if (!file.type.match('image.*')) {
    setDialogError('Vui lòng chọn file ảnh');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    setCurrentCourse(prevData => ({
      ...prevData,
      thumbnailFile: file,
      thumbnailPreview: e.target.result,
      thumbnail: '' // Xóa URL cũ khi upload file mới
    }));
  };
  reader.readAsDataURL(file);
};
// Tự động điền thumbnail từ YouTube URL
const autoFillThumbnail = () => {
  if (currentCourse.videoUrl) {
    const thumbnail = extractYouTubeThumbnail(currentCourse.videoUrl);
    if (thumbnail) {
      setCurrentCourse({
        ...currentCourse,
        thumbnail: thumbnail,
        thumbnailPreview: thumbnail,
        thumbnailFile: null
      });
    }
  }
};

// Trích xuất thumbnail từ YouTube URL
const extractYouTubeThumbnail = (url) => {
  if (!url) return null;
  
  try {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
  } catch (error) {}
  
  return null;
};

// Lưu khóa học
const handleSaveCourse = async () => {
  // Validation
  if (!currentCourse.title || !currentCourse.description || !currentCourse.categoryId) {
    setDialogError('Vui lòng điền đầy đủ các trường bắt buộc');
    return;
  }

  setDialogLoading(true);
  setDialogError('');

  try {
    // Sử dụng FormData để upload file
    const formData = new FormData();
    formData.append('title', currentCourse.title);
    formData.append('description', currentCourse.description);
    formData.append('categoryId', currentCourse.categoryId);
    formData.append('videoUrl', currentCourse.videoUrl || '');
    formData.append('instructor', currentCourse.instructor || '');
    formData.append('duration', currentCourse.duration || '');
    formData.append('level', currentCourse.level || 'BEGINNER');
    formData.append('featured', currentCourse.featured || false);
    
    // Nếu có file thumbnail mới, đính kèm vào request
    if (currentCourse.thumbnailFile) {
      formData.append('thumbnail', currentCourse.thumbnailFile);
    } else if (currentCourse.thumbnail && currentCourse.thumbnail.trim() !== '') {
      // Nếu có URL thumbnail, thêm vào formData
      formData.append('thumbnailUrl', currentCourse.thumbnail);
    }
    
    let response;
    
    if (isEditing) {
      // Luôn sử dụng multipart/form-data cho cả việc cập nhật
      response = await axiosInstance.put(`/admin/courses/${currentCourse.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Cập nhật danh sách khóa học
      setCourses(courses.map(course => 
        course.id === currentCourse.id ? response.data : course
      ));
    } else {
      // Tạo mới
      response = await axiosInstance.post('/admin/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Thêm khóa học mới vào danh sách
      setCourses([...courses, response.data]);
    }
    
    setOpenDialog(false);
    
    // Hiện thông báo thành công
    alert(isEditing ? 'Cập nhật khóa học thành công!' : 'Thêm khóa học thành công!');
    
  } catch (error) {
    console.error('Lỗi khi lưu khóa học:', error);
    setDialogError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu khóa học');
  } finally {
    setDialogLoading(false);
  }
};

  // Mở dialog thêm/sửa khóa học
  const handleOpenEditDialog = (course = null) => {
    if (course) {
      setCurrentCourse({
        ...course,
        thumbnailPreview: course.thumbnail,
        thumbnailFile: null
      });
      setIsEditing(true);
    } else {
      setCurrentCourse({
        id: null,
        title: '',
        description: '',
        thumbnail: '',
        thumbnailFile: null,
        thumbnailPreview: '',
        videoUrl: '',
        categoryId: '',
        duration: '',
        level: 'BEGINNER',
        instructor: '',
        featured: false
      });
      setIsEditing(false);
    }
    setDialogError('');
    setOpenDialog(true);
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentCourse({
      ...currentCourse,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  

  // Xóa khóa học
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này không?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/courses/${courseId}`);
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Lỗi khi xóa khóa học:', error);
      alert('Không thể xóa khóa học. Vui lòng thử lại sau.');
    }
  };

  

  

  

  return (
    <Container maxWidth="lg" component={motion.div} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="admin-course-management-page"
      sx={{ mt: 4, mb: 6 }}
    >
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý khóa học
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenEditDialog()}
          >
            Thêm khóa học
          </Button>
        </Box>

        {/* Search bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer component={Paper} elevation={0} className="course-table-container">
          <Table sx={{ minWidth: 650 }} aria-label="course management table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Thumbnail</TableCell>
                <TableCell>Cấp độ</TableCell>
                <TableCell>Nổi bật</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? filteredCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredCourses
              ).map((course) => (
                <TableRow key={course.id} hover>
                  <TableCell>{course.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {course.instructor || 'Chưa có giảng viên'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getCategoryName(course.categoryId)} 
                      size="small" 
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {course.thumbnail ? (
                      <Box
                        component="img"
                        src={course.thumbnail}
                        alt={course.title}
                        sx={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 1 }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/160x90?text=No+Image' }}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          width: 80, 
                          height: 45, 
                          bgcolor: 'grey.100', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          borderRadius: 1 
                        }}
                      >
                        <ImageIcon color="disabled" />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={course.level || 'BEGINNER'} 
                      size="small"
                      color={
                        course.level === 'ADVANCED' ? 'error' : 
                        course.level === 'INTERMEDIATE' ? 'warning' : 'success'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {course.featured ? (
                      <Chip label="Nổi bật" size="small" color="primary" />
                    ) : (
                      <Chip label="Bình thường" size="small" variant="outlined" color="default" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Sửa khóa học">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(course)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa khóa học">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteCourse(course.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {course.videoUrl && (
                        <Tooltip title="Xem video">
                          <IconButton
                            color="info"
                            size="small"
                            component="a"
                            href={course.videoUrl}
                            target="_blank"
                          >
                            <VideoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      Không tìm thấy khóa học nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'Tất cả', value: -1 }]}
          component="div"
          count={filteredCourses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count !== -1 ? count : 'nhiều hơn ' + to}`}
        />
      </Paper>

      {/* Dialog thêm/sửa khóa học */}
      <Dialog
        open={openDialog}
        onClose={() => !dialogLoading && setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Sửa khóa học' : 'Thêm khóa học mới'}
        </DialogTitle>
        <DialogContent dividers>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tiêu đề khóa học *"
                name="title"
                value={currentCourse.title}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  name="categoryId"
                  value={currentCourse.categoryId}
                  onChange={handleInputChange}
                  label="Danh mục"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên giảng viên"
                name="instructor"
                value={currentCourse.instructor || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Cấp độ</InputLabel>
                <Select
                  name="level"
                  value={currentCourse.level || 'BEGINNER'}
                  onChange={handleInputChange}
                  label="Cấp độ"
                >
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Thời lượng khóa học"
                name="duration"
                value={currentCourse.duration || ''}
                onChange={handleInputChange}
                placeholder="Ví dụ: 10 giờ 30 phút"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Khóa học nổi bật</InputLabel>
                <Select
                  name="featured"
                  value={currentCourse.featured || false}
                  onChange={handleInputChange}
                  label="Khóa học nổi bật"
                >
                  <MenuItem value={true}>Có</MenuItem>
                  <MenuItem value={false}>Không</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả khóa học *"
                name="description"
                value={currentCourse.description}
                onChange={handleInputChange}
                margin="normal"
                required
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Video URL (YouTube)"
                name="videoUrl"
                value={currentCourse.videoUrl || ''}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Lấy thumbnail từ YouTube URL">
                        <IconButton onClick={autoFillThumbnail} edge="end">
                          <VideoIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
                            <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Hình ảnh thumbnail khóa học
                </Typography>
                
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadIcon />}
                    color="primary"
                  >
                    Chọn ảnh từ máy tính
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleThumbnailUpload}
                    />
                  </Button>
                  
                  {currentCourse.thumbnailFile && (
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      Đã chọn: {currentCourse.thumbnailFile.name}
                    </Typography>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<VideoIcon />}
                    onClick={autoFillThumbnail}
                    disabled={!currentCourse.videoUrl}
                  >
                    Lấy từ YouTube
                  </Button>
                </Box>
                
                <TextField
                  fullWidth
                  label="Hoặc nhập URL hình ảnh"
                  name="thumbnail"
                  value={currentCourse.thumbnail || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  margin="normal"
                  helperText="Nhập URL hình ảnh, chọn file từ máy tính, hoặc tự động lấy từ video YouTube"
                  InputProps={{
                    endAdornment: currentCourse.thumbnail ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setCurrentCourse({...currentCourse, thumbnail: '', thumbnailPreview: ''})}
                          edge="end"
                        >
                          <CancelIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
                
                {(currentCourse.thumbnailPreview || currentCourse.thumbnail) && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Xem trước thumbnail:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
                      <Box
                        component="img"
                        src={currentCourse.thumbnailPreview || currentCourse.thumbnail}
                        alt="Thumbnail Preview"
                        sx={{ 
                          width: '100%', 
                          maxHeight: 200, 
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = 'https://via.placeholder.com/640x360?text=Lỗi+Hình+Ảnh';
                        }}
                      />
                    </Paper>
                  </Box>
                )}
              </Grid>
            
            
            
            
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)} 
            disabled={dialogLoading}
            startIcon={<CancelIcon />}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSaveCourse} 
            variant="contained" 
            color="primary"
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCourseManagementPage;