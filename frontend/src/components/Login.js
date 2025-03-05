import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { Facebook, Google } from '@mui/icons-material';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      const role = response.data.role === 'ADMIN' ? '/admin' : '/courses';
      navigate(role);
    } catch (error) {
      setError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8080/api/auth/${provider}`;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #4a90e2, #e94057)',
      padding: 3
    }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ padding: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>Sign In With</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Button onClick={() => handleSocialLogin('facebook')} variant="contained" color="primary" startIcon={<Facebook />}>Facebook</Button>
            <Button onClick={() => handleSocialLogin('google')} variant="contained" color="error" startIcon={<Google />}>Google</Button>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Username" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#000', color: '#fff' }}>Sign In</Button>
          </Box>
          <Typography sx={{ mt: 2 }}>
            Not a member? <Button onClick={() => navigate('/register')} sx={{ textTransform: 'none' }}>Sign up now</Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
