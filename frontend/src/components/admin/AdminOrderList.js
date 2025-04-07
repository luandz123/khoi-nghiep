import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Button,
  Menu,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

// Status definitions with colors that match the site's theme
const OrderStatus = {
  PENDING: { label: 'Chờ duyệt', color: '#f59e0b', bgColor: '#fef3c7' },
  PAID: { label: 'Đã thanh toán', color: '#3b82f6', bgColor: '#dbeafe' },
  SHIPPED: { label: 'Đang giao', color: '#6366f1', bgColor: '#e0e7ff' },
  COMPLETED: { label: 'Hoàn tất', color: '#10b981', bgColor: '#d1fae5' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bgColor: '#fee2e2' }
};

const AdminOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0
  });
  
  // For menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // For sorting
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // For notification
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search, orderBy, order]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      params.append('sort', `${orderBy},${order}`);

      const response = await axiosInstance.get('/admin/orders', { params });
      
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
        calculateOrderStats(response.data);
        setError('');
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', response.data);
        setError('Dữ liệu không đúng định dạng. Vui lòng thử lại sau.');
        // Fallback to empty array
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(`Không thể tải danh sách đơn hàng: ${error.response?.data?.message || error.message}. Vui lòng thử lại sau.`);
      // Set empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateOrderStats = (orderData = orders) => {
    // Calculate stats from the provided order data or use current state
    const stats = {
      total: orderData.length,
      pending: orderData.filter(order => order.status === 'PENDING').length,
      paid: orderData.filter(order => order.status === 'PAID').length,
      shipped: orderData.filter(order => order.status === 'SHIPPED').length,
      completed: orderData.filter(order => order.status === 'COMPLETED').length,
      cancelled: orderData.filter(order => order.status === 'CANCELLED').length
    };
    
    setOrderStats(stats);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}/status`, { 
        status: newStatus 
      });
      
      // Update the local state to avoid refetching
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Close the menu
      handleMenuClose();
      
      // Recalculate stats
      calculateOrderStats(updatedOrders);
      
      // Show notification
      setNotification({
        open: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({
        open: true,
        message: `Không thể cập nhật trạng thái đơn hàng: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleMenuClick = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };
  
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
    handleMenuClose();
  };
  
  const handlePrintOrder = (orderId) => {
    // Find the order to print
    const orderToPrint = orders.find(order => order.id === orderId);
    if (!orderToPrint) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNotification({
        open: true,
        message: 'Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình duyệt.',
        severity: 'error'
      });
      return;
    }
    
    // Write HTML content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Đơn hàng #${orderToPrint.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 50px; text-align: center; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ĐƠN HÀNG #${orderToPrint.id}</h1>
            <p>Ngày đặt: ${formatDate(orderToPrint.createdAt)}</p>
          </div>
          
          <div class="order-details">
            <h2>Thông tin khách hàng</h2>
            <p><strong>Tên:</strong> ${orderToPrint.customerName}</p>
            <p><strong>Email:</strong> ${orderToPrint.customerEmail}</p>
            <p><strong>Trạng thái:</strong> ${OrderStatus[orderToPrint.status]?.label || orderToPrint.status}</p>
          </div>
          
          <h2>Chi tiết đơn hàng</h2>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${orderToPrint.items?.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.price)}</td>
                  <td>${formatPrice(item.price * item.quantity)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">Không có thông tin chi tiết</td></tr>'}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Tổng cộng:</strong></td>
                <td><strong>${formatPrice(orderToPrint.totalPrice)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} LuanAcademy - Cảm ơn bạn đã mua hàng!</p>
          </div>
        </body>
      </html>
    `);
    
    // Print and close the window
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    handleMenuClose();
  };
  
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
      try {
        await axiosInstance.delete(`/admin/orders/${orderId}`);
        const updatedOrders = orders.filter(order => order.id !== orderId);
        setOrders(updatedOrders);
        calculateOrderStats(updatedOrders);
        
        setNotification({
          open: true,
          message: 'Xóa đơn hàng thành công',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting order:', error);
        setNotification({
          open: true,
          message: `Không thể xóa đơn hàng: ${error.response?.data?.message || error.message}`,
          severity: 'error'
        });
      }
    }
    handleMenuClose();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // For summary stats card style
  const getStatusCardStyle = (status) => {
    let color, icon;
    
    switch(status) {
      case 'total':
        color = '#6366f1';
        icon = '📊';
        break;
      case 'pending':
        color = OrderStatus.PENDING.color;
        icon = '⏳';
        break;
      case 'paid':
        color = OrderStatus.PAID.color;
        icon = '💰';
        break;
      case 'shipped':
        color = OrderStatus.SHIPPED.color;
        icon = '🚚';
        break;
      case 'completed':
        color = OrderStatus.COMPLETED.color;
        icon = '✅';
        break;
      case 'cancelled':
        color = OrderStatus.CANCELLED.color;
        icon = '❌';
        break;
      default:
        color = '#6366f1';
        icon = '📊';
    }
    
    return { color, icon };
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý Đơn hàng
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Quản lý và theo dõi tất cả đơn hàng từ khách hàng
      </Typography>
      
      {/* Order Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { key: 'total', label: 'Tổng đơn hàng' },
          { key: 'pending', label: 'Chờ duyệt' },
          { key: 'paid', label: 'Đã thanh toán' },
          { key: 'shipped', label: 'Đang giao' },
          { key: 'completed', label: 'Hoàn tất' },
          { key: 'cancelled', label: 'Đã hủy' }
        ].map((item) => {
          const { color, icon } = getStatusCardStyle(item.key);
          return (
            <Grid item xs={6} sm={4} md={2} key={item.key}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box 
                    sx={{ 
                      fontSize: '1.5rem',
                      mr: 1,
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${color}20`
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" sx={{ color }}>
                  {orderStats[item.key]}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchOrders}
              startIcon={<RefreshIcon />}
            >
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Search and Filter */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.08)',
          backgroundColor: 'background.paper'
        }}
      >
        <CardContent sx={{ p: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Trạng thái"
                  startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  {Object.entries(OrderStatus).map(([key, { label }]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="order-by-label">Sắp xếp theo</InputLabel>
                <Select
                  labelId="order-by-label"
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  label="Sắp xếp theo"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="createdAt">Ngày tạo</MenuItem>
                  <MenuItem value="totalPrice">Tổng tiền</MenuItem>
                  <MenuItem value="customerName">Tên khách hàng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={order === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                sx={{
                  py: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5253cc, #9146e0)'
                  }
                }}
              >
                {order === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
          ) : orders.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không tìm thấy đơn hàng nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                startIcon={<RefreshIcon />}
                onClick={fetchOrders}
              >
                Làm mới
              </Button>
            </Box>
          ) : (
            <TableContainer sx={{ overflow: 'auto', maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      onClick={() => handleSort('id')}
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        Mã đơn
                        {orderBy === 'id' && (
                          order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('customerName')}
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        Khách hàng
                        {orderBy === 'customerName' && (
                          order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      onClick={() => handleSort('totalPrice')}
                      align="right"
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        Tổng tiền
                        {orderBy === 'totalPrice' && (
                          order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                    <TableCell 
                      onClick={() => handleSort('createdAt')}
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        Ngày đặt
                        {orderBy === 'createdAt' && (
                          order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          #{order.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {order.customerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.customerEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatPrice(order.totalPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.itemCount || (order.items && order.items.length) || 0} sản phẩm
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={OrderStatus[order.status]?.label || order.status}
                          sx={{
                            backgroundColor: OrderStatus[order.status]?.bgColor || '#e2e8f0',
                            color: OrderStatus[order.status]?.color || '#64748b',
                            fontWeight: 'medium',
                            borderRadius: '16px'
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Tùy chọn">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, order.id)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </motion.div>
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 200,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 0.5
          }
        }}
      >
        <MenuItem onClick={() => handleViewOrder(selectedOrderId)}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        <Divider />
        {Object.entries(OrderStatus).map(([status, { label, color }]) => (
          <MenuItem 
            key={status} 
            onClick={() => handleStatusChange(selectedOrderId, status)}
            sx={{ 
              color,
              '&:hover': { backgroundColor: `${color}10` }
            }}
          >
            Cập nhật: {label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => handlePrintOrder(selectedOrderId)}>
          <PrintIcon fontSize="small" sx={{ mr: 1 }} />
          In đơn hàng
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteOrder(selectedOrderId)}
          sx={{ 
            color: 'error.main',
            '&:hover': { backgroundColor: 'error.light' }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa đơn hàng
        </MenuItem>
      </Menu>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOrderList;