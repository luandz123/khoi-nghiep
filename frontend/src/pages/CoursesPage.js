import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import {
  Container, Typography, Grid, Box, TextField, MenuItem,
  Select, FormControl, InputLabel, CircularProgress,
  Pagination, InputAdornment, Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  FilterList as FilterListIcon,
  Star as StarIcon, // Thêm icon nếu muốn hiển thị tiêu đề đặc biệt
  NewReleases as NewReleasesIcon // Thêm icon nếu muốn hiển thị tiêu đề đặc biệt
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import './CoursesPage.css';

// Đổi tên component cho đúng và nhận props
const CoursesPage = ({ featuredFilter = false, sortByNewest = false }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin route hiện tại
  const coursesPerPage = 9;

  // Xác định tiêu đề trang dựa trên props
  const pageTitle = featuredFilter ? "Khóa học nổi bật" : sortByNewest ? "Khóa học mới nhất" : "Khám phá các khóa học";
  const pageSubtitle = featuredFilter ? "Những khóa học được đánh giá cao" : sortByNewest ? "Các khóa học vừa được cập nhật" : "Nâng cao kỹ năng của bạn";
  const PageIcon = featuredFilter ? StarIcon : sortByNewest ? NewReleasesIcon : null;


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
    // Reset filters khi chuyển sang trang featured/new
    if (featuredFilter || sortByNewest) {
        setSearchTerm('');
        setCategory('');
        setLevel('');
    }
    setPage(1); // Reset về trang 1 khi filter thay đổi hoặc vào trang mới

    const fetchData = async () => {
      setLoading(true);
      setError(''); // Reset lỗi trước khi fetch
      try {
        let coursesEndpoint = '/courses'; // API mặc định
        let params = { // Params cho API /courses
          search: searchTerm,
          category: category,
          level: level
        };

        // Xác định endpoint và params dựa trên props
        if (featuredFilter) {
          coursesEndpoint = '/featured-courses';
          params = {}; // API này không cần params lọc khác
        } else if (sortByNewest) {
          coursesEndpoint = '/new-courses';
          params = {}; // API này không cần params lọc khác (có thể thêm limit nếu cần)
        } else {
           // Nếu là trang /courses thông thường, giữ nguyên params lọc
           // Nếu searchTerm, category, level rỗng thì params sẽ rỗng, backend trả tất cả
        }

        // Chỉ fetch categories nếu không phải trang featured/new (hoặc nếu bạn muốn hiển thị filter ở cả trang đó)
        const fetchCategoriesIfNeeded = !featuredFilter && !sortByNewest;

        const requests = [
            axiosInstance.get(coursesEndpoint, { params })
        ];

        if (fetchCategoriesIfNeeded) {
            requests.push(axiosInstance.get('/categories'));
        }

        const responses = await Promise.all(requests);

        setCourses(responses[0].data || []);

        if (fetchCategoriesIfNeeded && responses.length > 1) {
            setCategories(responses[1].data || []);
        } else if (!fetchCategoriesIfNeeded) {
            // Có thể ẩn bộ lọc hoặc giữ nguyên categories cũ nếu muốn
             setCategories([]); // Hoặc không thay đổi categories state
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Thêm featuredFilter, sortByNewest vào dependencies
  }, [searchTerm, category, level, featuredFilter, sortByNewest]);

  const getYoutubeThumbnail = (url) => {
    if (!url) return 'https://via.placeholder.com/640x360.png?text=No+Thumbnail';

    try {
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return 'https://via.placeholder.com/640x360.png?text=Invalid+YouTube+URL';
    } catch (error) {
      console.error('Error extracting YouTube thumbnail:', error);
      return 'https://via.placeholder.com/640x360.png?text=Error+Loading+Thumbnail';
    }
  };
    // Thêm hàm getThumbnailUrl tương tự như trong HomePage.js
  const getThumbnailUrl = (course) => {
    if (course.videoUrl) {
      return getYoutubeThumbnail(course.videoUrl);
    }
    if (!course.thumbnail) {
      return 'https://via.placeholder.com/640x360.png?text=No+Image';
    }
    if (course.thumbnail && course.thumbnail.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${course.thumbnail}`;
    }
    return course.thumbnail;
  };


  // Handle search change with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // setPage(1); // Đã xử lý trong useEffect
  };

  // Handle filter changes
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    // setPage(1); // Đã xử lý trong useEffect
  };

  const handleLevelChange = (e) => {
    setLevel(e.target.value);
    // setPage(1); // Đã xử lý trong useEffect
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

  // Ẩn bộ lọc trên trang featured/new nếu muốn
  const showFilters = !featuredFilter && !sortByNewest;


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
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           {PageIcon && <PageIcon sx={{ fontSize: '2.5rem', mr: 1, color: featuredFilter ? 'warning.main' : 'primary.main' }} />}
          {pageTitle}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          {pageSubtitle}
        </Typography>
      </Box>

      {/* Filters - Chỉ hiển thị nếu showFilters là true */}
      {showFilters && (
        <>
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
        </>
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
      ) : loading ? ( // Hiển thị loading indicator khi đang fetch
         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <CircularProgress />
         </Box>
      ): courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.6 }} />
          <Typography variant="h5" gutterBottom>
            Không tìm thấy khóa học nào
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {showFilters ? "Vui lòng thử với bộ lọc khác hoặc quay lại sau." : "Hiện chưa có khóa học nào trong mục này."}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Bỏ dòng "Hiển thị x khóa học" nếu không cần thiết */}
          {/* <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Hiển thị {courses.length} khóa học
          </Typography> */}

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
                        src={getThumbnailUrl(course)}
                        alt={course.title}
                        className="course-image"
                        onError={(e) => {
                          console.log('Image load failed for:', course.title);
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/640x360.png?text=No+Image';
                        }}
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

export default CoursesPage; // Đảm bảo export đúng tên component