import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FaSearch, FaHome, FaBox, FaNewspaper } from 'react-icons/fa';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const productsPerPage = 6;

  // Fetch products từ endpoint admin
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }
    queryParams.append('page', page - 1);
    queryParams.append('size', productsPerPage);

    fetch(`http://localhost:8080/api/admin/products?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, [searchTerm, page]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f9ff', pt: 8 }}>
      <Container maxWidth="lg">
        <Box>
          <Typography variant="h4" align="center" sx={{ mb: 4, mt: 4, fontWeight: 'bold', color: '#1a2b3c' }}>
            Sản Phẩm Mới Nhất
          </Typography>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <TextField
              variant="outlined"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              sx={{
                width: 400,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 30,
                  p: '0.9rem 1.2rem 0.9rem 3rem',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  '& fieldset': { border: '2px solid #ddd' },
                  '&:hover fieldset': { border: '2px solid #00bcd4' },
                  '&.Mui-focused fieldset': { border: '2px solid #00bcd4', boxShadow: '0 4px 15px rgba(0,188,212,0.3)' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '1.2rem' }}/>
                )
              }}
            />
          </Box>
          <Grid container spacing={3}>
            {products.length > 0 ? (
              products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.imageUrl || 'https://via.placeholder.com/300x200'}
                      alt={product.name}
                      sx={{
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0',
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: '1.5rem' }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        background: 'linear-gradient(45deg, #1a2b3c, #00bcd4)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent'
                      }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        color: '#666'
                      }}>
                        {product.description}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ mt: 1, color: '#ff4500', fontWeight: 'bold' }}>
                        {product.price.toLocaleString('vi-VN')} VNĐ
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#999' }}>
                        Còn lại: {product.stock} | {new Date(product.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: '1rem', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        disabled={product.stock === 0}
                        sx={{
                          background: 'linear-gradient(45deg, #ffd700, #ffcc00)',
                          color: '#1a2b3c',
                          p: '0.8rem 2rem',
                          borderRadius: 30,
                          fontWeight: 600,
                          fontSize: '1rem',
                          boxShadow: '0 5px 15px rgba(255,215,0,0.5)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #ffcc00, #ffaa00)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 7px 20px rgba(255,215,0,0.7)'
                          },
                          '&:disabled': {
                            background: '#ccc',
                            color: '#666',
                            boxShadow: 'none'
                          }
                        }}
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {product.stock > 0 ? 'Mua Ngay' : 'Hết Hàng'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography align="center" variant="h6" sx={{ color: '#333' }}>
                  Không có sản phẩm nào.
                </Typography>
              </Grid>
            )}
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
      <Box className="footer" sx={{
          background: 'linear-gradient(135deg, #1a2b3c, #2d4a6c)',
          color: 'white',
          p: '2.5rem 1.5rem',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 -5px 15px rgba(0,0,0,0.1)',
          mt: 8
      }}>
        <Box className="waves">
          <Box className="wave" id="wave1" />
          <Box className="wave" id="wave2" />
          <Box className="wave" id="wave3" />
          <Box className="wave" id="wave4" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
          <IconButton sx={{ color: 'white', fontSize: '1.4rem', p: '0.8rem', borderRadius: 50, '&:hover': { color: '#ff4500', background: 'rgba(255,69,0,0.1)', transform: 'scale(1.1)' }}}>
            <FaHome />
          </IconButton>
          <IconButton sx={{ color: 'white', fontSize: '1.4rem', p: '0.8rem', borderRadius: 50, '&:hover': { color: '#ff4500', background: 'rgba(255,69,0,0.1)', transform: 'scale(1.1)' }}}>
            <FaBox />
          </IconButton>
          <IconButton sx={{ color: 'white', fontSize: '1.4rem', p: '0.8rem', borderRadius: 50, '&:hover': { color: '#ff4500', background: 'rgba(255,69,0,0.1)', transform: 'scale(1.1)' }}}>
            <FaNewspaper />
          </IconButton>
        </Box>
        <Typography variant="body2">
          © 2025 Shop. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductsPage;