import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/auth/register', formData);
      setIsSuccess(true);
      setMessage('Đăng ký thành công!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4a90e2, #e94057)',
        padding: 3,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ padding: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Đăng ký
          </Typography>

          {message && <Alert severity={isSuccess ? 'success' : 'error'}>{message}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#000', color: '#fff' }}>
              Đăng ký
            </Button>
          </Box>

          <Typography sx={{ mt: 2 }}>
            Đã có tài khoản?{' '}
            <Button onClick={() => navigate('/login')} sx={{ textTransform: 'none' }}>
              Đăng nhập
            </Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;