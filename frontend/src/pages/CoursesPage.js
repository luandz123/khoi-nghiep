import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Grid, Box, TextField, MenuItem, 
  Select, FormControl, InputLabel, CircularProgress, 
  Pagination, InputAdornment, Chip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  School as SchoolIcon,
  Category as CategoryIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import './CoursesPage.css';

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const coursesPerPage = 9;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  useEffect(() => {
    // Fetch courses and categories
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/courses', {
            params: { 
              search: searchTerm,
              category: category, 
              level: level 
            }
          }),
          axiosInstance.get('/categories')
        ]);
        
        setCourses(coursesRes.data || []);
        setCategories(categoriesRes.data || []);
        setError('');
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, category, level]);

  // Get YouTube thumbnail from video URL
  const getYoutubeThumbnail = (url) => {
    if (!url) return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';
    
    try {
      const videoId = url.includes('v=') 
        ? url.split('v=')[1].split('&')[0]
        : url.split('/').pop();
        
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } catch (error) {
      return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';
    }
  };

  // Handle search change with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Handle filter changes
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleLevelChange = (e) => {
    setLevel(e.target.value);
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination
  const indexOfLastCourse = page * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  if (loading && courses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Khám phá các khóa học
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          Nâng cao kỹ năng của bạn với các khóa học chất lượng cao từ những giảng viên hàng đầu
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 2 }}
        />
        
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="category-label"><CategoryIcon sx={{ mr: 1 }} /> Danh mục</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            onChange={handleCategoryChange}
            label="Danh mục"
          >
            <MenuItem value="">Tất cả danh mục</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="level-label"><SchoolIcon sx={{ mr: 1 }} /> Cấp độ</InputLabel>
          <Select
            labelId="level-label"
            value={level}
            onChange={handleLevelChange}
            label="Cấp độ"
          >
            <MenuItem value="">Tất cả cấp độ</MenuItem>
            <MenuItem value="beginner">Người mới bắt đầu</MenuItem>
            <MenuItem value="intermediate">Trung cấp</MenuItem>
            <MenuItem value="advanced">Nâng cao</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Applied filters */}
      {(searchTerm || category || level) && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} /> Bộ lọc:
          </Typography>
          
          {searchTerm && (
            <Chip 
              label={`Tìm kiếm: ${searchTerm}`} 
              onDelete={() => setSearchTerm('')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {category && (
            <Chip 
              label={`Danh mục: ${categories.find(c => c.id.toString() === category)?.name || category}`}
              onDelete={() => setCategory('')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {level && (
            <Chip 
              label={`Cấp độ: ${level === 'beginner' ? 'Người mới' : level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}`}
              onDelete={() => setLevel('')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {error ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body1">
            Vui lòng làm mới trang hoặc thử lại sau.
          </Typography>
        </Box>
      ) : courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.6 }} />
          <Typography variant="h5" gutterBottom>
            Không tìm thấy khóa học nào
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vui lòng thử với bộ lọc khác hoặc quay lại sau.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Hiển thị {courses.length} khóa học
          </Typography>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {currentCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <motion.div variants={itemVariants}>
                    <Box 
                      className="course-card" 
                      onClick={() => navigate(`/courses/${course.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box className="course-image-container">
                        <img 
                          src={course.thumbnail || getYoutubeThumbnail(course.videoUrl)} 
                          alt={course.title}
                          className="course-image"
                        />
                        <Box className="course-overlay">
                          <Box className="course-category">
                            {course.categoryName || 'Khóa học'}
                          </Box>
                          <Box className="course-level">
                            {course.level || 'Cơ bản'}
                          </Box>
                        </Box>
                      </Box>
                      <Box className="course-content">
                        <Typography variant="h6" className="course-title">
                          {course.title}
                        </Typography>
                        <Typography variant="body2" className="course-instructor">
                          Giảng viên: {course.instructor || 'Nguyễn Văn Luan'}
                        </Typography>
                        <Typography variant="body2" className="course-stats">
                          <span>{course.duration || '10 giờ'}</span>
                          <span>{course.studentsCount || 0} học viên</span>
                        </Typography>
                        <Box className="course-progress-container">
                          <Box className="view-course-btn">Xem khóa học</Box>
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CoursePage;