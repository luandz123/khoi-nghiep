import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar 
} from '@mui/material';
import axiosInstance from '../../utils/axiosConfig';

const AdminAddCoursePage = () => {
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    categoryId: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      console.log('Danh mục từ API:', response.data);
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        throw new Error('Dữ liệu danh mục không phải là mảng');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      showAlert('Không thể tải danh sách danh mục', 'error');
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      showAlert('Vui lòng chọn một danh mục', 'warning');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      thumbnail: formData.thumbnail,
      categoryId: parseInt(formData.categoryId), // Chuyển categoryId thành số
      videoUrl: formData.videoUrl
    };

    console.log('Dữ liệu gửi đi:', payload);

    try {
      const response = await axiosInstance.post('/admin/courses', payload);
      console.log('Phản hồi từ server:', response.data);
      showAlert('Thêm khóa học thành công', 'success');
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        categoryId: '',
        videoUrl: ''
      });
    } catch (error) {
      console.error('Lỗi khi tạo khóa học:', error.response?.data || error.message);
      showAlert(`Lỗi khi tạo khóa học: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" sx={{ my: 4 }}>
        Thêm Khóa Học Mới
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField 
          label="Tiêu đề" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          required 
          fullWidth
        />
        <TextField 
          label="Mô tả" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          multiline 
          rows={4} 
          required 
          fullWidth
        />
        <TextField 
          label="URL Thumbnail" 
          name="thumbnail" 
          value={formData.thumbnail} 
          onChange={handleChange} 
          fullWidth
        />
        <FormControl required fullWidth error={!formData.categoryId && alert.severity === 'warning'}>
          <InputLabel id="category-label">Danh mục</InputLabel>
          <Select
            labelId="category-label"
            label="Danh mục"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>Chọn danh mục</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField 
          label="URL Video" 
          name="videoUrl" 
          value={formData.videoUrl} 
          onChange={handleChange} 
          required 
          fullWidth
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          sx={{ mt: 2, py: 1.5 }}
        >
          Thêm Khóa Học
        </Button>
      </Box>

      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminAddCoursePage;