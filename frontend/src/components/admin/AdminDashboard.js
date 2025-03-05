import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography, Box, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, IconButton, Menu, MenuItem, Badge
} from '@mui/material';
import { PeopleAlt, School, ShoppingCart, AttachMoney, Notifications, Person } from '@mui/icons-material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Sử dụng endpoint với chữ thường để khớp với backend
        const response = await axiosInstance.get('/admin/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const response = await axiosInstance.get('/admin/dashboard/recentOrders');
        setRecentOrders(response.data);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    fetchStats();
    fetchRecentOrders();
  }, []);

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = { PENDING: '#ffc107', PAID: '#4caf50', SHIPPED: '#2196f3', CANCELLED: '#f44336' };
    return colors[status] || '#757575';
  };

  // Giúp định dạng tiền tệ cho VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, percentage }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
        background: `linear-gradient(45deg, ${color} 30%, ${color}99 90%)`,
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'translateY(-5px)' }
      }}
    >
      <Box sx={{ color: 'white' }}>{icon}</Box>
      <Box>
        <Typography variant="h6" color="white">{title}</Typography>
        <Typography variant="h4" color="white" fontWeight="bold">{value}</Typography>
        {percentage !== undefined && (
          <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
            {percentage > 0 ? '+' : ''}{percentage}% so với tháng trước
          </Typography>
        )}
      </Box>
    </Paper>
  );

  StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.element.isRequired,
    color: PropTypes.string.isRequired,
    percentage: PropTypes.number
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
        <Badge badgeContent={4} color="error">
          <IconButton>
            <Notifications />
          </IconButton>
        </Badge>
        <IconButton onClick={handleProfileClick}>
          <Avatar sx={{ bgcolor: '#1976d2' }}>
            <Person />
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleClose}>Hồ sơ</MenuItem>
          <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
        </Menu>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Người dùng"
            value={stats?.totalUsers || 0}
            icon={<PeopleAlt sx={{ fontSize: 40 }} />}
            color="#2196f3"
            percentage={stats?.userChangePercentage}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Khóa học"
            value={stats?.totalCourses || 0}
            icon={<School sx={{ fontSize: 40 }} />}
            color="#4caf50"
            percentage={stats?.courseChangePercentage}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đơn hàng"
            value={stats?.totalOrders || 0}
            icon={<ShoppingCart sx={{ fontSize: 40 }} />}
            color="#ff9800"
            percentage={stats?.orderChangePercentage}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu"
            value={stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="#f44336"
            percentage={stats?.revenueChangePercentage}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.revenueByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Tháng: ${label}`}
                />
                <Line type="monotone" dataKey="revenue" stroke="#2196f3" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Đơn hàng gần đây
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          {order.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;