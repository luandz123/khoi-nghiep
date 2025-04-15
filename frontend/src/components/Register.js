import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosConfig';
import './Auth.css'; // Dùng chung file CSS với Login

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset message when user changes input
    if (message) setMessage('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (formData.password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setIsSuccess(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData; // Remove confirmPassword
      await axiosInstance.post('/auth/register', submitData);
      setIsSuccess(true);
      setMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
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
            Đăng ký tài khoản
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tạo tài khoản để truy cập đầy đủ tính năng và khóa học
          </Typography>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity={isSuccess ? 'success' : 'error'} sx={{ my: 2 }}>
                {message}
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
              Đăng ký với Google
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<FacebookIcon />}
              onClick={() => handleSocialLogin('facebook')}
              className="facebook-btn"
              disabled={isLoading}
            >
              Đăng ký với Facebook
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng ký với email
            </Typography>
          </Divider>

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            className="auth-form"
          >
            <TextField
              fullWidth
              label="Họ và tên"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

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
              helperText="Mật khẩu cần ít nhất 6 ký tự"
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

            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              {isLoading ? <CircularProgress size={24} /> : 'Đăng ký'}
            </Button>
          </Box>

          <Box className="auth-footer">
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?
            </Typography>
            <Button 
              onClick={() => navigate('/login')}
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              Đăng nhập
            </Button>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
};

export default Register;