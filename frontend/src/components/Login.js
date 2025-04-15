import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Alert, Paper,
  Divider, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { 
  Facebook as FacebookIcon, 
  Google as GoogleIcon,
  Visibility, 
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import './Auth.css'; // Tạo file CSS dùng chung cho Login và Register

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Kiểm tra xem có message từ redirect không (ví dụ từ my-courses)
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Xóa thông báo lỗi khi người dùng thay đổi input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user', JSON.stringify({
        name: response.data.name || 'Người dùng',
        email: formData.email,
        avatar: response.data.avatar
      }));
      
      // Redirect dựa vào role hoặc trang trước đó
      const redirectPath = location.state?.from || (response.data.role === 'ADMIN' ? '/admin' : '/courses');
      navigate(redirectPath);
    } catch (error) {
      setError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Lưu lại thông tin redirect để sau khi đăng nhập có thể quay lại
    if (location.state?.from) {
      localStorage.setItem('redirectAfterLogin', location.state.from);
    }
    window.location.href = `http://localhost:8080/api/auth/${provider}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="auth-page"
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={6} 
          className="auth-paper"
          component={motion.div}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        >
          <Typography variant="h4" className="auth-title">
            Đăng nhập
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Đăng nhập để truy cập khóa học và lưu tiến độ học tập
          </Typography>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert 
                severity="error" 
                sx={{ my: 2, '& .MuiAlert-message': { width: '100%' } }}
              >
                {error}
              </Alert>
            </motion.div>
          )}
          
          <Box className="social-buttons">
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialLogin('google')}
              className="google-btn"
              disabled={isLoading}
            >
              Đăng nhập với Google
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<FacebookIcon />}
              onClick={() => handleSocialLogin('facebook')}
              className="facebook-btn"
              disabled={isLoading}
            >
              Đăng nhập với Facebook
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng nhập với email
            </Typography>
          </Divider>
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            className="auth-form"
          >
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="auth-submit"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
          </Box>
          
          <Box className="auth-footer">
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?
            </Typography>
            <Button 
              onClick={() => navigate('/register')}
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              Đăng ký ngay
            </Button>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
};

export default Login;