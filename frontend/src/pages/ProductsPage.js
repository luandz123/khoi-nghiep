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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaSearch, FaShoppingCart, FaFilter, FaSort, FaHeart } from 'react-icons/fa';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [openFilters, setOpenFilters] = useState(false);
  const navigate = useNavigate();
  const productsPerPage = 6;

  // Mock categories for display when API fails
  const categories = [
    { id: 'laptop', name: 'Laptop' },
    { id: 'sach', name: 'Sách' },
    { id: 'phu-kien', name: 'Phụ kiện' },
    { id: 'man-hinh', name: 'Màn hình' }
  ];

  // Mock products for display when API fails
  const mockProducts = [
    {
      id: 1,
      name: "Laptop HP Victus 15",
      description: "Laptop dành cho lập trình viên với cấu hình mạnh, màn hình 15.6 inch FHD, CPU i7 thế hệ 12.",
      price: 22990000,
      originalPrice: 25990000,
      discount: 12,
      stock: 15,
      imageUrl: "https://cdn2.cellphones.com.vn/x358,webp,q100/media/catalog/product/h/p/hp_victus_15_fa0031dx_1.jpg",
      category: "Laptop",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Bàn phím cơ Gaming Keychron K2",
      description: "Bàn phím cơ không dây, có đèn LED RGB, kết nối Bluetooth, pin 4000mAh.",
      price: 1990000,
      originalPrice: 2490000,
      discount: 20,
      stock: 8,
      imageUrl: "https://keychron.vn/wp-content/uploads/2021/07/ban-phim-co-keychron-k2-rgb-aluminum-gateron-brown-switch-1.jpg",
      category: "Phụ kiện",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Chuột không dây Logitech MX Master 3",
      description: "Chuột cao cấp với cảm biến Darkfield, kết nối Bluetooth/USB, thiết kế cong.",
      price: 2490000,
      originalPrice: 2490000,
      discount: 0,
      stock: 12,
      imageUrl: "https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3/gallery/mx-master-3-product-gallery-graphite-1.png",
      category: "Phụ kiện",
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      name: "Sách 'Clean Code' - Robert C. Martin",
      description: "Cuốn sách kinh điển dành cho lập trình viên về cách viết code sạch và dễ bảo trì.",
      price: 490000,
      originalPrice: 550000,
      discount: 10,
      stock: 20,
      imageUrl: "https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg",
      category: "Sách",
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      name: "Tai nghe Sony WH-1000XM4",
      description: "Tai nghe chống ồn cao cấp, chất lượng âm thanh hi-res, pin 30 giờ.",
      price: 5990000,
      originalPrice: 8490000,
      discount: 30,
      stock: 5,
      imageUrl: "https://product.hstatic.net/1000026716/product/tai-nghe-chong-on-sony-wh-1000xm4-1_468eaaab80b2474484b8d05a4fe99dc2.jpg",
      category: "Phụ kiện",
      createdAt: new Date().toISOString()
    },
    {
      id: 6,
      name: "Màn hình Dell UltraSharp 27 inch 4K",
      description: "Màn hình 4K, tấm nền IPS, độ phủ màu 99% sRGB, cổng kết nối đa dạng.",
      price: 11990000,
      originalPrice: 13990000,
      discount: 15,
      stock: 0,
      imageUrl: "https://m.media-amazon.com/images/I/81WN+HyZYdL._AC_SX679_.jpg",
      category: "Màn hình",
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, page, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }
    if (selectedCategory) {
      queryParams.append('category', selectedCategory);
    }
    queryParams.append('page', page - 1);
    queryParams.append('size', productsPerPage);
    queryParams.append('sort', sortBy === 'newest' ? 'createdAt,desc' : 'price,asc');

    try {
      // Fetch từ API
      const response = await fetch(`http://localhost:8080/api/admin/products?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data && data.content && data.content.length > 0) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        // Nếu không có sản phẩm từ API, sử dụng dữ liệu mẫu
        const filteredMockProducts = mockProducts.filter(product => {
          const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesCategory = !selectedCategory || 
            product.category.toLowerCase() === selectedCategory.toLowerCase();
          
          return matchesSearch && matchesCategory;
        });
        
        setProducts(filteredMockProducts);
        setTotalPages(Math.ceil(filteredMockProducts.length / productsPerPage));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Sử dụng dữ liệu mẫu khi không thể kết nối API
      setProducts(mockProducts);
      setTotalPages(Math.ceil(mockProducts.length / productsPerPage));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

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
            Sản Phẩm & Phụ Kiện
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 5, color: '#64748b', maxWidth: 600, mx: 'auto' }}>
            Khám phá các sản phẩm chất lượng cao để hỗ trợ quá trình học tập của bạn
          </Typography>
        </motion.div>

        {/* Filter section */}
        <Box sx={{ mb: 5 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Tìm kiếm sản phẩm..."
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
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    label="Danh mục"
                    startAdornment={<FaFilter style={{ marginRight: 8, color: '#6366f1' }} />}
                    sx={{ 
                      borderRadius: 2, 
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Sắp xếp</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    label="Sắp xếp"
                    startAdornment={<FaSort style={{ marginRight: 8, color: '#6366f1' }} />}
                    sx={{ 
                      borderRadius: 2, 
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <MenuItem value="newest">Mới nhất</MenuItem>
                    <MenuItem value="price">Giá thấp nhất</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.7,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #5253cc, #9146e0)',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }
                  }}
                >
                  Tìm kiếm
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>

        <Divider sx={{ my: 4, width: '100%', maxWidth: '200px', mx: 'auto', borderColor: '#e2e8f0' }} />
        
        {/* Products Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" my={8}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id || index}>
                    <motion.div variants={itemVariants}>
                      <Card className="product-card">
                        {product.discount > 0 && (
                          <Chip
                            label={`-${product.discount}%`}
                            color="error"
                            size="small"
                            className="discount-badge"
                          />
                        )}
                        
                        <Box className="image-container">
                          <CardMedia
                            component="img"
                            height="220"
                            image={product.imageUrl || `https://source.unsplash.com/500x500/?product,${index}`}
                            alt={product.name}
                            className="product-image"
                          />
                          <Box className="product-actions">
                            <Button 
                              className="wishlist-btn"
                              variant="contained" 
                              size="small"
                              aria-label="Add to wishlist"
                            >
                              <FaHeart />
                            </Button>
                            <Button 
                              className="cart-btn"
                              variant="contained" 
                              size="small"
                              disabled={product.stock === 0}
                              aria-label="Add to cart"
                            >
                              <FaShoppingCart />
                            </Button>
                          </Box>
                        </Box>
                        
                        <CardContent className="product-content">
                          <Chip 
                            label={product.category || 'Sản phẩm'} 
                            size="small" 
                            className="category-chip"
                          />
                          <Typography variant="h6" className="product-name">
                            {product.name}
                          </Typography>
                          <Typography variant="body2" className="product-description">
                            {product.description}
                          </Typography>
                          <Box className="product-price-container">
                            {product.discount > 0 ? (
                              <>
                                <Typography variant="body2" className="original-price">
                                  {product.originalPrice?.toLocaleString('vi-VN')} VNĐ
                                </Typography>
                                <Typography variant="h6" className="discount-price">
                                  {product.price?.toLocaleString('vi-VN')} VNĐ
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="h6" className="current-price">
                                {product.price?.toLocaleString('vi-VN')} VNĐ
                              </Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" className="stock-info">
                              {product.stock > 0 ? `Còn lại: ${product.stock}` : 'Hết hàng'}
                            </Typography>
                            <Typography variant="caption" className="date-info">
                              {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Box>
                        </CardContent>
                        
                        <CardActions className="product-footer">
                          <Button
                            variant="contained"
                            fullWidth
                            disabled={product.stock === 0}
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="buy-now-btn"
                          >
                            {product.stock > 0 ? 'Mua Ngay' : 'Hết Hàng'}
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
                      Không tìm thấy sản phẩm nào
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                      Vui lòng thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                        setSortBy('newest');
                        setPage(1);
                      }}
                      sx={{
                        borderColor: '#6366f1',
                        color: '#6366f1',
                        borderRadius: 8,
                        px: 3,
                        '&:hover': {
                          borderColor: '#4f46e5',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)'
                        }
                      }}
                    >
                      Xem tất cả sản phẩm
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </motion.div>
        )}

        {/* Pagination */}
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
              className="custom-pagination"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductsPage;