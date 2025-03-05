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
  IconButton
} from '@mui/material';
import {
  FaSearch,
  FaHome,
  FaNewspaper,
  FaBox,
 
} from 'react-icons/fa';
import './NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const newsPerPage = 6;

  useEffect(() => {
    // Giả lập fetch dữ liệu từ backend (thay bằng API thực tế)
    const fetchNews = async () => {
      try {
        const dummyNews = Array.from({ length: 12 }, (_, index) => ({
          id: index + 1,
          title: `Tin tức ${index + 1} - Lập trình ${index + 1}`,
          description: `Mô tả ngắn gọn về tin tức ${index + 1} liên quan đến lập trình và công nghệ tại LuanAcademy.`,
          thumbnail: `https://via.placeholder.com/300x200?text=News${index + 1}`,
          createdDate: new Date().toISOString(),
          author: `Tác giả ${index + 1}`,
          category: index % 2 === 0 ? 'Công nghệ' : 'Lập trình'
        }));
        setNews(dummyNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);



  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedNews = filteredNews.slice((page - 1) * newsPerPage, page * newsPerPage);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', pt: 8 }}>
      <Container maxWidth="lg">
        
     
      

        {/* Main Content */}
        <Box >
          <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#1a2b3c', mt: 4 }}>
            Tin Tức Mới Nhất
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <TextField
              variant="outlined"
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: 400,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 30,
                  p: '0.9rem 1.2rem 0.9rem 3rem',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  '& fieldset': { border: '2px solid #ddd' },
                  '&:hover fieldset': { border: '2px solid #00bcd4' },
                  '&.Mui-focused fieldset': { border: '2px solid #00bcd4', boxShadow: '0 4px 15px rgba(0, 188, 212, 0.3)' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <FaSearch
                    style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '1.2rem' }}
                  />
                )
              }}
            />
          </Box>
          <Grid container spacing={3}>
            {paginatedNews.map((newsItem) => (
              <Grid item xs={12} sm={6} md={4} key={newsItem.id}>
                <Card className="news-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={newsItem.thumbnail}
                    alt={newsItem.title}
                    sx={{ objectFit: 'cover', borderRadius: '12px 12px 0 0', transition: 'opacity 0.3s ease' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: '1.5rem' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        background: 'linear-gradient(45deg, #1a2b3c, #00bcd4)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent'
                      }}
                    >
                      {newsItem.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', color: '#666' }}
                    >
                      {newsItem.description}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, color: '#999', display: 'block' }}>
                      {new Date(newsItem.createdDate).toLocaleDateString()} | {newsItem.author}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: '1rem', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(45deg, #ffd700, #ffcc00)',
                        color: '#1a2b3c',
                        p: '0.8rem 2rem',
                        borderRadius: 30,
                        fontWeight: 600,
                        fontSize: '1rem',
                        boxShadow: '0 5px 15px rgba(255, 215, 0, 0.5)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #ffcc00, #ffaa00)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 7px 20px rgba(255, 215, 0, 0.7)'
                        }
                      }}
                      onClick={() => navigate(`/news/${newsItem.id}`)}
                    >
                      Đọc thêm
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#1a2b3c',
                  '&.Mui-selected': { background: 'linear-gradient(45deg, #ff4500, #ff6f61)', color: 'white' }
                }
              }}
            />
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        className="footer"
        sx={{ background: 'linear-gradient(135deg, #1a2b3c, #2d4a6c)', color: 'white', p: '2.5rem 1.5rem', position: 'relative', textAlign: 'center', boxShadow: '0 -5px 15px rgba(0, 0, 0, 0.1)', mt: 8 }}
      >
        <Box className="waves">
          <Box className="wave" id="wave1" />
          <Box className="wave" id="wave2" />
          <Box className="wave" id="wave3" />
          <Box className="wave" id="wave4" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
          <IconButton
            sx={{
              color: 'white',
              fontSize: '1.4rem',
              p: '0.8rem',
              borderRadius: 50,
              '&:hover': { color: '#ff4500', background: 'rgba(255, 69, 0, 0.1)', transform: 'scale(1.1)' }
            }}
          >
            <FaHome />
          </IconButton>
          <IconButton
            sx={{
              color: 'white',
              fontSize: '1.4rem',
              p: '0.8rem',
              borderRadius: 50,
              '&:hover': { color: '#ff4500', background: 'rgba(255, 69, 0, 0.1)', transform: 'scale(1.1)' }
            }}
          >
            <FaNewspaper />
          </IconButton>
          <IconButton
            sx={{
              color: 'white',
              fontSize: '1.4rem',
              p: '0.8rem',
              borderRadius: 50,
              '&:hover': { color: '#ff4500', background: 'rgba(255, 69, 0, 0.1)', transform: 'scale(1.1)' }
            }}
          >
            <FaBox />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', padding: '0.8rem 1.5rem', borderRadius: 25, transition: 'all 0.3s ease' }}>
            Trang chủ
          </Link>
          <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', padding: '0.8rem 1.5rem', borderRadius: 25, transition: 'all 0.3s ease' }}>
            Giới thiệu
          </Link>
          <Link to="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', padding: '0.8rem 1.5rem', borderRadius: 25, transition: 'all 0.3s ease' }}>
            Liên hệ
          </Link>
        </Box>
        <Typography sx={{ fontSize: '0.9rem', opacity: 0.7 }}>©2025 LuanAcademy | All Rights Reserved</Typography>
      </Box>
    </Box>
  );
};

export default NewsPage;