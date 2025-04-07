import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Paper, Typography, Box, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, Card, CardContent
} from '@mui/material';
import { 
  PeopleAlt, 
  School, 
  ShoppingCart, 
  AttachMoney,
  TrendingUp, 
  TrendingDown,
  MoreVert 
} from '@mui/icons-material';
import {  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Mock data since backend may not be ready
        const mockStats = {
          totalUsers: 1845,
          totalCourses: 124,
          totalOrders: 352,
          totalRevenue: 34500000,
          userChangePercentage: 12,
          courseChangePercentage: 8,
          orderChangePercentage: 15,
          revenueChangePercentage: 22,
          revenueByMonth: [
            { month: 'Tháng 1', revenue: 22000000 },
            { month: 'Tháng 2', revenue: 19000000 },
            { month: 'Tháng 3', revenue: 25000000 },
            { month: 'Tháng 4', revenue: 28000000 },
            { month: 'Tháng 5', revenue: 26000000 },
            { month: 'Tháng 6', revenue: 31000000 },
          ],
          categoryDistribution: [
            { name: 'Lập trình', value: 45 },
            { name: 'Thiết kế', value: 20 },
            { name: 'Marketing', value: 15 },
            { name: 'Ngoại ngữ', value: 10 },
            { name: 'Khác', value: 10 },
          ]
        };
        
        // Try to get data from API, fallback to mock data
        try {
          const response = await axiosInstance.get('/admin/dashboard/stats');
          if (response.data) {
            setStats(response.data);
          } else {
            setStats(mockStats);
          }
        } catch (error) {
          console.error('Error fetching stats from API, using mock data:', error);
          setStats(mockStats);
        }
      } catch (error) {
        console.error('Error setting up stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentOrders = async () => {
      try {
        // Mock orders data
        const mockOrders = [
          { id: 1123, customerName: 'Nguyễn Văn A', status: 'PAID', amount: 1500000, date: '2025-04-01' },
          { id: 1124, customerName: 'Trần Thị B', status: 'PENDING', amount: 2450000, date: '2025-04-02' },
          { id: 1125, customerName: 'Lê Văn C', status: 'SHIPPED', amount: 5780000, date: '2025-04-03' },
          { id: 1126, customerName: 'Phạm Thị D', status: 'CANCELLED', amount: 960000, date: '2025-04-04' },
          { id: 1127, customerName: 'Hoàng Văn E', status: 'PAID', amount: 3240000, date: '2025-04-05' },
        ];
        
        try {
          const response = await axiosInstance.get('/admin/dashboard/recentOrders');
          if (response.data && response.data.length > 0) {
            setRecentOrders(response.data);
          } else {
            setRecentOrders(mockOrders);
          }
        } catch (error) {
          console.error('Error fetching recent orders from API, using mock data:', error);
          setRecentOrders(mockOrders);
        }
      } catch (error) {
        console.error('Error setting up recent orders:', error);
      }
    };

    fetchStats();
    fetchRecentOrders();
  }, []);

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

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

  const StatCard = ({ title, value, icon, color, percentage }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 4,
        background: 'white',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.08)',
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          background: `${color}16`,
        }}>
          <Box sx={{ color: color }}>{icon}</Box>
        </Box>
        
        {percentage !== undefined && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: percentage >= 0 ? 'success.main' : 'error.main',
            bgcolor: percentage >= 0 ? 'success.light' : 'error.light',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {percentage >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            <Box component="span" sx={{ ml: 0.5 }}>
              {Math.abs(percentage)}%
            </Box>
          </Box>
        )}
      </Box>
      
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
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
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng người dùng"
            value={stats?.totalUsers.toLocaleString() || 0}
            icon={<PeopleAlt sx={{ fontSize: 28 }} />}
            color="#6366f1"
            percentage={stats?.userChangePercentage}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng khóa học"
            value={stats?.totalCourses.toLocaleString() || 0}
            icon={<School sx={{ fontSize: 28 }} />}
            color="#a855f7"
            percentage={stats?.courseChangePercentage}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng đơn hàng"
            value={stats?.totalOrders.toLocaleString() || 0}
            icon={<ShoppingCart sx={{ fontSize: 28 }} />}
            color="#14b8a6"
            percentage={stats?.orderChangePercentage}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng doanh thu"
            value={stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
            icon={<AttachMoney sx={{ fontSize: 28 }} />}
            color="#f97316"
            percentage={stats?.revenueChangePercentage}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              height: '100%',
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Doanh thu theo tháng
              </Typography>
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.revenueByMonth || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#94a3b8" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: 'none', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Phân bố khóa học
              </Typography>
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ height: 220, display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats?.categoryDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  borderRadius: 2,
                  p: 1,
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(99, 102, 241, 0.04)'
                  }
                }}
                onClick={() => navigate('/admin/courses')}
              >
                Xem chi tiết
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.08)'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Đơn hàng gần đây
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ color: '#6366f1' }}
                  onClick={() => navigate('/admin/orders')}
                >
                  Xem tất cả
                </Button>
              </Box>
              
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ngày</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Số tiền</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow 
                        key={order.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                        }}
                      >
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{formatCurrency(order.amount)}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: getStatusColor(order.status),
                              color: 'white',
                              py: 0.5,
                              px: 1.5,
                              borderRadius: 2,
                              display: 'inline-block',
                              fontWeight: 'medium',
                              fontSize: '0.75rem'
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;