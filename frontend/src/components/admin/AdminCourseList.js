import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    categoryId: '', // initially stored as a string from the Select
    videoUrl: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Helper: Finds the category name for a course using either the full category object or its categoryId.
const getCategoryName = (course) => {
  if (typeof course.category === 'string' && course.category.trim() !== "") {
    return course.category;
  } else if (course.category && course.category.name) {
    return course.category.name;
  } else if (course.categoryId) {
    const cat = categories.find((c) =>
      c.id.toString() === course.categoryId.toString()
    );
    return cat ? cat.name : 'N/A';
  }
  return 'N/A';
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure the categoryId is sent as a number
    const payload = {
      ...formData,
      categoryId: Number(formData.categoryId)
    };
    try {
      if (selectedCourse) {
        await axiosInstance.put(`/admin/courses/${selectedCourse.id}`, payload);
      } else {
        await axiosInstance.post('/admin/courses', payload);
      }
      fetchCourses();
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await axiosInstance.delete(`/admin/courses/${id}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    // Determine the correct value for categoryId safely:
    const selectedCategoryId =
      course.category && course.category.id != null
        ? course.category.id
        : course.categoryId;
    setFormData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      // Safely convert the selectedCategoryId to a string (or fallback to an empty string)
      categoryId: selectedCategoryId ? selectedCategoryId.toString() : '',
      videoUrl: course.videoUrl || ''
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      categoryId: '',
      videoUrl: ''
    });
    setSelectedCourse(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quản lý khóa học</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Thêm khóa học
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thumbnail</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Video URL</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.id}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.description}</TableCell>
                <TableCell>
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      style={{ width: '80px', height: 'auto' }}
                    />
                  )}
                </TableCell>
                <TableCell>{getCategoryName(course)}</TableCell>
                <TableCell>{course.videoUrl}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(course)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(course.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tiêu đề"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Thumbnail URL"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="course-category-label">Danh mục</InputLabel>
                  <Select
                    labelId="course-category-label"
                    label="Danh mục"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Video URL"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained">
              {selectedCourse ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminCourseList;