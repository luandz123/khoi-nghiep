import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  Pagination,
  Chip,
  InputAdornment,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaUser, FaTag } from 'react-icons/fa';
import './NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const navigate = useNavigate();
  const newsPerPage = 6;

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
    // Giả lập fetch dữ liệu từ backend (thay bằng API thực tế)
    const fetchNews = async () => {
      try {
        const dummyNews = Array.from({ length: 12 }, (_, index) => ({
          id: index + 1,
          title: `${index % 2 === 0 ? 'Khóa học mới' : 'Tin công nghệ'} - ${index % 3 === 0 ? 'Lập trình React' : index % 3 === 1 ? 'Phát triển web' : 'AI và Machine Learning'} ${index + 1}`,
          description: `${index % 2 === 0 
            ? `LuanAcademy vừa ra mắt khóa học mới giúp bạn nâng cao kỹ năng lập trình. Khóa học được thiết kế bởi các chuyên gia hàng đầu, cung cấp kiến thức từ cơ bản đến nâng cao.` 
            : `Những xu hướng công nghệ mới nhất đang định hình tương lai ngành IT. Cập nhật những công nghệ hot nhất hiện nay và cách chúng ảnh hưởng đến thị trường việc làm.`}`,
          thumbnail: `https://source.unsplash.com/500x300/?coding,technology,${index + 1}`,
          createdDate: new Date(Date.now() - index * 86400000).toISOString(),
          author: `${index % 3 === 0 ? 'Nguyễn Văn Luân' : index % 3 === 1 ? 'Trần Minh Quân' : 'Lê Thị Hồng'}`,
          category: index % 3 === 0 ? 'Khóa học' : index % 3 === 1 ? 'Công nghệ' : 'Tin tức'
        }));
        setNews(dummyNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);

  const categories = ['Tất cả', 'Khóa học', 'Công nghệ', 'Tin tức'];

  const filteredNews = news.filter(
    (item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || selectedCategory === 'Tất cả' || 
        item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }
  );

  const paginatedNews = filteredNews.slice((page - 1) * newsPerPage, page * newsPerPage);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === 'Tất cả' ? '' : category);
    setPage(1);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: '80px', paddingBottom: '60px' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" align="center" sx={{
            fontWeight: 800,
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            Tin Tức & Bài Viết
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 5, color: '#64748b', maxWidth: 700, mx: 'auto' }}>
            Cập nhật những thông tin mới nhất về khóa học, công nghệ và tin tức từ LuanAcademy
          </Typography>
        </motion.div>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 5 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaSearch style={{ color: '#6366f1' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    bgcolor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    '& fieldset': {
                      borderColor: '#e2e8f0'
                    },
                    '&:hover fieldset': {
                      borderColor: '#6366f1'
                    }
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Categories Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                clickable
                onClick={() => handleCategoryClick(category)}
                variant={selectedCategory === category || (category === 'Tất cả' && selectedCategory === '') ? 'filled' : 'outlined'}
                color="primary"
                sx={{
                  px: 2,
                  py: 2.5,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  borderRadius: '50px',
                  backgroundColor: selectedCategory === category || (category === 'Tất cả' && selectedCategory === '') 
                    ? 'linear-gradient(90deg, #6366f1, #a855f7)' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedCategory === category || (category === 'Tất cả' && selectedCategory === '')
                      ? 'linear-gradient(90deg, #5253cc, #9146e0)'
                      : 'rgba(99, 102, 241, 0.1)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Featured News Item - First Item Larger */}
        {paginatedNews.length > 0 && page === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card 
              sx={{ 
                mb: 5, 
                borderRadius: 3, 
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <Grid container>
                <Grid item xs={12} md={6}>
                  <CardMedia
                    component="img"
                    height="400"
                    image={paginatedNews[0].thumbnail}
                    alt={paginatedNews[0].title}
                    sx={{ 
                      objectFit: 'cover',
                      height: '100%'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Chip 
                      label={paginatedNews[0].category} 
                      color="primary" 
                      size="small"
                      sx={{ 
                        alignSelf: 'flex-start', 
                        mb: 2, 
                        borderRadius: '50px',
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                      }}
                    />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                      {paginatedNews[0].title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                      {paginatedNews[0].description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, color: '#64748b' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FaCalendarAlt />
                        <Typography variant="body2">
                          {new Date(paginatedNews[0].createdDate).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FaUser />
                        <Typography variant="body2">
                          {paginatedNews[0].author}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => navigate(`/news/${paginatedNews[0].id}`)}
                      sx={{
                        py: 1.5,
                        borderRadius: 8,
                        fontWeight: 600,
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #5253cc, #9146e0)',
                          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                        }
                      }}
                    >
                      Đọc chi tiết
                    </Button>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        <Divider sx={{ my: 5, width: '100%', maxWidth: '200px', mx: 'auto', borderColor: '#e2e8f0' }} />

        {/* News Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {paginatedNews.length > 0 ? (
              paginatedNews.map((newsItem, index) => {
                // Skip the first item on the first page since it's displayed as featured
                if (index === 0 && page === 1) return null;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={newsItem.id}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        className="news-card"
                        sx={{ 
                          height: '100%',
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={newsItem.thumbnail}
                            alt={newsItem.title}
                            sx={{ 
                              transition: 'transform 0.6s',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                          <Chip 
                            label={newsItem.category} 
                            color="primary" 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: 12, 
                              left: 12,
                              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                              fontWeight: 500
                            }}
                          />
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                          <Typography 
                            variant="h6" 
                            component="h2" 
                            sx={{ 
                              fontWeight: 700, 
                              mb: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4
                            }}
                          >
                            {newsItem.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              height: '4.5em'
                            }}
                          >
                            {newsItem.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FaCalendarAlt size={12} />
                              <Typography variant="caption">
                                {new Date(newsItem.createdDate).toLocaleDateString('vi-VN')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FaUser size={12} />
                              <Typography variant="caption">
                                {newsItem.author}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button 
                            variant="outlined" 
                            fullWidth
                            onClick={() => navigate(`/news/${newsItem.id}`)}
                            sx={{
                              borderRadius: 8,
                              borderColor: '#6366f1',
                              color: '#6366f1',
                              '&:hover': {
                                borderColor: '#5253cc',
                                backgroundColor: 'rgba(99, 102, 241, 0.04)'
                              }
                            }}
                          >
                            Đọc chi tiết
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
                    Không tìm thấy tin tức nào phù hợp
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Vui lòng thử tìm kiếm với từ khóa khác hoặc xem tất cả tin tức
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 3 }}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                  >
                    Xem tất cả tin tức
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </motion.div>

        {totalPages > 1 && (
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              variant="outlined"
              shape="rounded"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default NewsPage;