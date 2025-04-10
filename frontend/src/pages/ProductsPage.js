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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Paper,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  LaptopMac as LaptopIcon,
  MenuBook as BookIcon,
  Code as CodeIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  CreditCard as CreditCardIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import './ProductsPage.css';
import axiosInstance from '../utils/axiosConfig';

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [openFilters, setOpenFilters] = useState(false);
  const navigate = useNavigate();
  const productsPerPage = 9;

  // Cart related states
  const [cartItems, setCartItems] = useState([]);
  const [openCart, setOpenCart] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Checkout related states
  const [openCheckout, setOpenCheckout] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Contact dialog state
  const [openContact, setOpenContact] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Product types
  const productTypes = [
    { id: 'all', name: 'Tất cả', icon: <FilterListIcon /> },
    { id: 'tech', name: 'Sản phẩm công nghệ', icon: <LaptopIcon /> },
    { id: 'course', name: 'Khóa học', icon: <SchoolIcon /> },
    { id: 'book', name: 'Sách IT', icon: <BookIcon /> },
    { id: 'source', name: 'Source code', icon: <CodeIcon /> }
  ];

  // Categories for filtering
  const categories = [
    { id: '', name: 'Tất cả' },
    { id: 'laptop', name: 'Laptop' },
    { id: 'accessory', name: 'Phụ kiện' },
    { id: 'book', name: 'Sách IT' },
    { id: 'course', name: 'Khóa học' },
    { id: 'source', name: 'Source code' },
    { id: 'monitor', name: 'Màn hình' }
  ];

  // Payment methods
  const paymentMethods = [
    { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: <MoneyIcon /> },
    { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: <CreditCardIcon /> },
    { id: 'momo', name: 'Ví MoMo', icon: <CreditCardIcon /> },
    { id: 'vnpay', name: 'VNPay', icon: <CreditCardIcon /> }
  ];

  const steps = ['Thông tin giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

  useEffect(() => {
    fetchProducts();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [searchTerm, page, selectedCategory, sortBy, selectedType]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const fetchProducts = async () => {
    setLoading(true);
    
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }
    if (selectedCategory) {
      queryParams.append('category', selectedCategory);
    }
    if (selectedType !== 'all') {
      queryParams.append('type', selectedType);
    }
    queryParams.append('page', page - 1);
    queryParams.append('size', productsPerPage);
    queryParams.append('sort', sortBy === 'newest' ? 'createdAt,desc' : 'price,asc');

    try {
      // Fetch products from API
      const response = await axiosInstance.get(`/api/products?${queryParams.toString()}`);
      
      if (response.data) {
        const { content, totalPages: pages } = response.data;
        setProducts(content);
        setTotalPages(pages);
      } else {
        // Fallback to mock data
        setProducts(mockProducts);
        setTotalPages(Math.ceil(mockProducts.length / productsPerPage));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Use mock data on error
      setProducts(mockProducts);
      setTotalPages(Math.ceil(mockProducts.length / productsPerPage));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    // Let the useEffect trigger the fetchProducts
  };
  
  const isContactProduct = (product) => {
    return ['course', 'book', 'source'].includes(product.type);
  };
  
  const getProductTypeIcon = (type) => {
    switch (type) {
      case 'tech': return <LaptopIcon />;
      case 'course': return <SchoolIcon />;
      case 'book': return <BookIcon />;
      case 'source': return <CodeIcon />;
      default: return null;
    }
  };

  const handleAddToCart = (product) => {
    if (isContactProduct(product)) {
      setSelectedProduct(product);
      setOpenContact(true);
      return;
    }
    
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems(prevItems => [...prevItems, { ...product, quantity: 1 }]);
    }
    
    setNotification({
      open: true,
      message: 'Sản phẩm đã được thêm vào giỏ hàng',
      severity: 'success'
    });
  };

  const handleUpdateCartQuantity = (productId, increment) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          const newQuantity = increment 
            ? item.quantity + 1 
            : Math.max(1, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    
    setNotification({
      open: true,
      message: 'Sản phẩm đã được xóa khỏi giỏ hàng',
      severity: 'info'
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      setNotification({
        open: true,
        message: 'Giỏ hàng trống',
        severity: 'warning'
      });
      return;
    }
    setOpenCheckout(true);
    setOpenCart(false);
  };

  const handleShippingDetailsChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping details
      const requiredFields = ['fullName', 'email', 'phone', 'address', 'city'];
      const missingFields = requiredFields.filter(field => !shippingDetails[field]);
      
      if (missingFields.length > 0) {
        setNotification({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin giao hàng',
          severity: 'error'
        });
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingDetails.email)) {
        setNotification({
          open: true,
          message: 'Email không hợp lệ',
          severity: 'error'
        });
        return;
      }
      
      // Phone validation
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(shippingDetails.phone)) {
        setNotification({
          open: true,
          message: 'Số điện thoại không hợp lệ (10 số)',
          severity: 'error'
        });
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customerName: shippingDetails.fullName,
        customerEmail: shippingDetails.email,
        customerPhone: shippingDetails.phone,
        shippingAddress: `${shippingDetails.address}, ${shippingDetails.city}${shippingDetails.zipCode ? ', ' + shippingDetails.zipCode : ''}`,
        paymentMethod: paymentMethod,
        totalPrice: calculateTotal(),
        notes: shippingDetails.notes || ''
      };
      
      // Call API to create order
      const response = await axiosInstance.post('/api/orders', orderData);
      
      if (response.data && response.data.id) {
        setOrderId(response.data.id);
        setOrderCompleted(true);
        setActiveStep(3);
        setCartItems([]);
        
        setNotification({
          open: true,
          message: 'Đặt hàng thành công!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setNotification({
        open: true,
        message: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.',
        severity: 'error'
      });
    }
  };

  const handleCloseCheckout = () => {
    if (orderCompleted) {
      setActiveStep(0);
      setOrderCompleted(false);
      setOrderId(null);
    }
    setOpenCheckout(false);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

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
      type: "tech",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Bàn phím cơ Keychron K2",
      description: "Bàn phím cơ không dây, có đèn LED RGB, kết nối Bluetooth, pin 4000mAh.",
      price: 1990000,
      originalPrice: 2490000,
      discount: 20,
      stock: 8,
      imageUrl: "https://keychron.vn/wp-content/uploads/2021/07/ban-phim-co-keychron-k2-rgb-aluminum-gateron-brown-switch-1.jpg",
      category: "Phụ kiện",
      type: "tech",
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Chuột Logitech MX Master 3",
      description: "Chuột cao cấp với cảm biến Darkfield, kết nối Bluetooth/USB, thiết kế cong.",
      price: 2490000,
      originalPrice: 2490000,
      discount: 0,
      stock: 12,
      imageUrl: "https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3/gallery/mx-master-3-product-gallery-graphite-1.png",
      category: "Phụ kiện",
      type: "tech",
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
      type: "book",
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
      type: "tech",
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
      type: "tech",
      createdAt: new Date().toISOString()
    },
    {
      id: 7,
      name: "Khóa học Full-Stack Web Developer",
      description: "Học lập trình web từ cơ bản đến nâng cao với React, Node.js và MongoDB.",
      price: 2990000,
      originalPrice: 3990000,
      discount: 25,
      stock: 999,
      imageUrl: "https://academy.binance.com/_next/image?url=https%3A%2F%2Fimage.binance.vision%2Fuploads-original%2F0ee9d7d59d424a7c8bd7d70c86070beb.png&w=1920&q=80",
      category: "Khóa học",
      type: "course",
      createdAt: new Date().toISOString()
    },
    {
      id: 8,
      name: "Source code Shop thương mại điện tử",
      description: "Mã nguồn hoàn chỉnh cho website thương mại điện tử với React, Spring Boot và MySQL.",
      price: 5490000,
      originalPrice: 6490000,
      discount: 15,
      stock: 100,
      imageUrl: "https://themewagon.com/wp-content/uploads/2021/01/evara.jpg",
      category: "Source code",
      type: "source",
      createdAt: new Date().toISOString()
    },
    {
      id: 9,
      name: "Sách 'Design Patterns'",
      description: "Giải thích các mẫu thiết kế phần mềm cơ bản và nâng cao một cách dễ hiểu.",
      price: 390000,
      originalPrice: 450000,
      discount: 13,
      stock: 15,
      imageUrl: "https://m.media-amazon.com/images/I/51szD9HC9pL._SX395_BO1,204,203,200_.jpg",
      category: "Sách",
      type: "book",
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={5}>
            <Typography variant="h3" fontWeight="800" gutterBottom sx={{
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '16px'
            }}>
              Sản Phẩm & Khóa Học
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Khám phá các sản phẩm công nghệ, khóa học lập trình, sách IT và source code đa dạng
            </Typography>
            
            <Badge 
              badgeContent={cartItems.length} 
              color="error" 
              sx={{ position: 'fixed', top: 90, right: 30, zIndex: 1200 }}
            >
              <IconButton 
                onClick={() => setOpenCart(true)} 
                sx={{ 
                  backgroundColor: '#6366f1',
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                  '&:hover': { backgroundColor: '#4f46e5' }
                }}
              >
                <ShoppingCartIcon />
              </IconButton>
            </Badge>
          </Box>
        </motion.div>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'rgba(0,0,0,0.08)' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <form onSubmit={handleSearch}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#6366f1' }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </form>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Danh mục"
                    sx={{ borderRadius: 2 }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sắp xếp theo</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sắp xếp theo"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="newest">Mới nhất</MenuItem>
                    <MenuItem value="price_asc">Giá tăng dần</MenuItem>
                    <MenuItem value="price_desc">Giá giảm dần</MenuItem>
                    <MenuItem value="discount">Khuyến mãi</MenuItem>
                    <MenuItem value="popularity">Phổ biến</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Tabs
                value={selectedType}
                onChange={(e, newValue) => setSelectedType(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#6366f1',
                  },
                }}
              >
                {productTypes.map((type) => (
                  <Tab
                    key={type.id}
                    value={type.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Box component="span" sx={{ ml: 1 }}>{type.name}</Box>
                      </Box>
                    }
                    sx={{
                      '&.Mui-selected': {
                        color: '#6366f1',
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Paper>
        </Box>

        {/* Products Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        ) : (
          <>
            {products.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Typography variant="h5" gutterBottom>
                  Không tìm thấy sản phẩm
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  Vui lòng thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedType('all');
                  }}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #5253cc, #9146e0)',
                      boxShadow: '0 6px 15px rgba(99, 102, 241, 0.4)',
                    }
                  }}
                >
                  Xem tất cả sản phẩm
                </Button>
              </Box>
            ) : (
              <>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <Grid container spacing={3}>
                    {products.map((product) => (
                      <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <motion.div variants={itemVariants}>
                          <Card className="product-card">
                            <Box className="image-container">
                              <CardMedia
                                component="img"
                                height="200"
                                image={product.imageUrl}
                                alt={product.name}
                                className="product-image"
                              />
                              
                              {/* Product type badge */}
                              <Chip
                                icon={getProductTypeIcon(product.type)}
                                label={
                                  product.type === 'tech' ? 'Sản phẩm' :
                                  product.type === 'course' ? 'Khóa học' :
                                  product.type === 'book' ? 'Sách IT' :
                                  product.type === 'source' ? 'Source code' : ''
                                }
                                sx={{
                                  position: 'absolute',
                                  top: '10px',
                                  left: '10px',
                                  backgroundColor: 
                                    product.type === 'tech' ? '#3b82f6' :
                                    product.type === 'course' ? '#10b981' :
                                    product.type === 'book' ? '#f97316' :
                                    product.type === 'source' ? '#8b5cf6' : '#6b7280',
                                  color: 'white',
                                  fontWeight: 500
                                }}
                                size="small"
                              />
                              
                              {product.discount > 0 && (
                                <Chip
                                  label={`-${product.discount}%`}
                                  className="discount-badge"
                                />
                              )}
                              
                              <div className="product-actions">
                                <IconButton 
                                  className="wishlist-btn"
                                  aria-label="add to favorites"
                                >
                                  <FavoriteBorderIcon />
                                </IconButton>
                                <IconButton 
                                  className="cart-btn" 
                                  aria-label="add to cart"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={product.stock === 0}
                                >
                                  {
                                    isContactProduct(product) ? 
                                    <WhatsAppIcon /> :
                                    <ShoppingCartIcon />
                                  }
                                </IconButton>
                              </div>
                            </Box>
                            
                            <CardContent className="product-content">
                              <Chip 
                                label={product.category} 
                                className="category-chip"
                                size="small"
                              />
                              
                              <Typography 
                                variant="h6" 
                                component="div" 
                                className="product-name"
                              >
                                {product.name}
                              </Typography>
                              
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                className="product-description"
                              >
                                {product.description}
                              </Typography>
                              
                              <Box className="product-price-container">
                                {product.discount > 0 && (
                                  <Typography 
                                    variant="body2" 
                                    className="original-price"
                                    component="span"
                                    sx={{ mr: 1 }}
                                  >
                                    {formatPrice(product.originalPrice)}
                                  </Typography>
                                )}
                                
                                <Typography 
                                  variant="body1" 
                                  className={product.discount > 0 ? "discount-price" : "current-price"}
                                  component="span"
                                >
                                  {formatPrice(product.price)}
                                </Typography>
                              </Box>
                              
                              <Box mt={1} display="flex" justifyContent="space-between">
                                {product.type === 'tech' && (
                                  <Typography variant="caption" className="stock-info">
                                    {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                                  </Typography>
                                )}
                                
                                <Typography variant="caption" className="date-info">
                                  {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                </Typography>
                              </Box>
                            </CardContent>
                            
                            <CardActions className="product-footer">
                              <Button 
                                variant="contained"
                                fullWidth
                                className="buy-now-btn"
                                startIcon={isContactProduct(product) ? <WhatsAppIcon /> : <ShoppingCartIcon />}
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0 && product.type === 'tech'}
                              >
                                {isContactProduct(product) ? 'Liên hệ mua' : 'Thêm vào giỏ'}
                              </Button>
                            </CardActions>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                      size="large"
                      className="custom-pagination"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Container>
      
      {/* Shopping Cart Drawer */}
      <Drawer
        anchor="right"
        open={openCart}
        onClose={() => setOpenCart(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            padding: 3,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Giỏ hàng</Typography>
          <IconButton onClick={() => setOpenCart(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {cartItems.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '50vh' 
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" align="center">
              Giỏ hàng trống
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Thêm sản phẩm để tiếp tục
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setOpenCart(false)}
              sx={{ borderRadius: 2 }}
            >
              Tiếp tục mua sắm
            </Button>
          </Box>
        ) : (
          <>
            <List sx={{ mb: 3, maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    mb: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    position: 'relative',
                    padding: 2
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%', 
                    position: 'relative' 
                  }}>
                    <Box 
                      component="img" 
                      src={item.imageUrl} 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 1,
                        objectFit: 'cover',
                        mr: 2
                      }} 
                    />
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {item.name}
                      </Typography>
                      
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {formatPrice(item.price)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateCartQuantity(item.id, false)}
                          sx={{ p: 0.5, bgcolor: 'background.default' }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        
                        <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateCartQuantity(item.id, true)}
                          sx={{ p: 0.5, bgcolor: 'background.default' }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveFromCart(item.id)}
                      sx={{ 
                        color: 'error.main',
                        position: 'absolute',
                        top: -10,
                        right: -10
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tổng sản phẩm:</Typography>
                <Typography variant="body1">{cartItems.length} sản phẩm</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Số lượng:</Typography>
                <Typography variant="body1">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)} món
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Thành tiền:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatPrice(calculateTotal())}
                </Typography>
              </Box>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleProceedToCheckout}
              startIcon={<ShoppingCartIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(90deg, #5253cc, #9146e0)',
                  boxShadow: '0 6px 15px rgba(99, 102, 241, 0.4)',
                }
              }}
            >
              Thanh toán
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenCart(false)}
              sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
            >
              Tiếp tục mua sắm
            </Button>
          </>
        )}
      </Drawer>
      
      {/* Checkout Dialog */}
      <Dialog
        open={openCheckout}
        onClose={handleCloseCheckout}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 0, position: 'relative' }}>
          <Typography variant="h5" fontWeight="bold">
            {orderCompleted ? 'Đặt hàng thành công' : 'Thanh toán'}
          </Typography>
          <IconButton
            onClick={handleCloseCheckout}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {orderCompleted ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Box
                sx={{
                  bgcolor: '#10b981',
                  color: 'white',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <CheckIcon sx={{ fontSize: 40 }} />
              </Box>
              
              <Typography variant="h5" gutterBottom>
                Cảm ơn bạn đã đặt hàng!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Đơn hàng #{orderId} của bạn đã được tiếp nhận thành công.
                Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
              </Typography>
              
              <Button
                variant="contained"
                onClick={() => navigate('/me/orders')}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                  mr: 2
                }}
              >
                Xem đơn hàng
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleCloseCheckout}
                sx={{ borderRadius: 2, textTransform: 'none', px: 4, py: 1 }}
              >
                Tiếp tục mua sắm
              </Button>
            </Box>
          ) : (
            <>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="fullName"
                      value={shippingDetails.fullName}
                      onChange={handleShippingDetailsChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={shippingDetails.email}
                      onChange={handleShippingDetailsChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={shippingDetails.phone}
                      onChange={handleShippingDetailsChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mã bưu điện (tuỳ chọn)"
                      name="zipCode"
                      value={shippingDetails.zipCode}
                      onChange={handleShippingDetailsChange}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      name="address"
                      value={shippingDetails.address}
                      onChange={handleShippingDetailsChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Thành phố/Tỉnh"
                      name="city"
                      value={shippingDetails.city}
                      onChange={handleShippingDetailsChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ghi chú đơn hàng (tuỳ chọn)"
                      name="notes"
                      value={shippingDetails.notes}
                      onChange={handleShippingDetailsChange}
                      multiline
                      rows={3}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              )}
              
              {activeStep === 1 && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="h6" gutterBottom>Chọn phương thức thanh toán</Typography>
                  
                  <RadioGroup
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    {paymentMethods.map((method) => (
                      <FormControlLabel
                        key={method.id}
                        value={method.id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {method.icon}
                            <Typography sx={{ ml: 1 }}>{method.name}</Typography>
                          </Box>
                        }
                        sx={{
                          border: '1px solid',
                          borderColor: paymentMethod === method.id ? 'primary.main' : 'rgba(0,0,0,0.12)',
                          borderRadius: 2,
                          p: 1,
                          m: 1,
                          width: '100%',
                          backgroundColor: paymentMethod === method.id ? 'rgba(99,102,241,0.05)' : 'transparent'
                        }}
                      />
                    ))}
                  </RadioGroup>
                  
                  {paymentMethod === 'bank' && (
                    <Paper elevation={0} sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'rgba(0,0,0,0.12)', borderRadius: 2 }}>
                      <Typography variant="body2">
                        <strong>Thông tin chuyển khoản:</strong>
                      </Typography>
                      <Typography variant="body2">
                        Ngân hàng: BIDV
                      </Typography>
                      <Typography variant="body2">
                        Số tài khoản: 12345678900
                      </Typography>
                      <Typography variant="body2">
                        Chủ tài khoản: NGUYEN VAN LUAN
                      </Typography>
                      <Typography variant="body2">
                        Nội dung: Thanh toan [Mã đơn hàng] - [Tên của bạn]
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
              
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Xác nhận đơn hàng</Typography>
                  
                  {/* Order Summary */}
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'rgba(0,0,0,0.12)', borderRadius: 2, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Thông tin liên hệ
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Họ tên:</strong> {shippingDetails.fullName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {shippingDetails.email}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Số điện thoại:</strong> {shippingDetails.phone}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Địa chỉ:</strong> {shippingDetails.address}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Thành phố:</strong> {shippingDetails.city}
                        </Typography>
                        {shippingDetails.zipCode && (
                          <Typography variant="body2">
                            <strong>Mã bưu điện:</strong> {shippingDetails.zipCode}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'rgba(0,0,0,0.12)', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Thông tin đặt hàng
                    </Typography>
                    
                    {cartItems.map((item) => (
                      <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                        <Box 
                          component="img" 
                          src={item.imageUrl} 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: 1, 
                            mr: 1,
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity} x {formatPrice(item.price)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatPrice(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tạm tính:</Typography>
                      <Typography variant="body2">{formatPrice(calculateTotal())}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Phí vận chuyển:</Typography>
                      <Typography variant="body2">Miễn phí</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Tổng cộng:</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatPrice(calculateTotal())}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        <strong>Phương thức thanh toán:</strong>
                      </Typography>
                      <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                        {paymentMethods.find(m => m.id === paymentMethod)?.icon}
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {paymentMethods.find(m => m.id === paymentMethod)?.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
        {!orderCompleted && (
          <DialogActions sx={{ px: 3, pb: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Quay lại
              </Button>
            )}
            
            {activeStep < 2 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5253cc, #9146e0)',
                    boxShadow: '0 6px 15px rgba(99, 102, 241, 0.4)',
                  }
                }}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmitOrder}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
                  textTransform: 'none',
                  px: 4,
                  py: 1
                }}
              >
                Hoàn tất đặt hàng
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>
      
      {/* Contact Dialog for Courses, Books, Source Code */}
      <Dialog
        open={openContact}
        onClose={() => setOpenContact(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WhatsAppIcon sx={{ mr: 1, color: '#25D366' }} />
            <Typography variant="h6">Liên hệ để mua hàng</Typography>
          </Box>
        </DialogTitle>
        
        <IconButton
          onClick={() => setOpenContact(false)}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent>
          {selectedProduct && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  component="img"
                  src={selectedProduct.imageUrl}
                  sx={{ width: 80, height: 80, borderRadius: 2, mr: 2, objectFit: 'cover' }}
                />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedProduct.name}
                  </Typography>
                  <Typography variant="body1" color="primary" fontWeight="bold">
                    {formatPrice(selectedProduct.price)}
                  </Typography>
                </Box>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Để mua {
                  selectedProduct.type === 'course' ? 'khóa học' : 
                  selectedProduct.type === 'book' ? 'sách' : 'source code'
                } này, vui lòng liên hệ với chúng tôi qua Zalo để được hướng dẫn thanh toán và nhận tài liệu.
              </Alert>
              
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Thông tin liên hệ
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WhatsAppIcon sx={{ mr: 1, color: '#25D366' }} />
                  <Typography variant="body1">Zalo: 0923 456 789</Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Thời gian hỗ trợ: 8:00 - 22:00 (Tất cả các ngày)
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<WhatsAppIcon />}
                  onClick={() => window.open('https://zalo.me/0923456789', '_blank')}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#25D366',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#22c55e'
                    }
                  }}
                >
                  Nhắn tin Zalo ngay
                </Button>
              </Paper>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenContact(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage;