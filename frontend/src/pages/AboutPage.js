import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Về LuanAcademy
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="body1" paragraph>
            LuanAcademy là nền tảng học trực tuyến hàng đầu, được thành lập với mục tiêu mang đến kiến thức chất lượng cao, 
            dễ tiếp cận cho mọi người. Chúng tôi cung cấp các khóa học đa dạng từ lập trình, thiết kế đến kinh doanh và phát triển cá nhân.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại, LuanAcademy cam kết mang đến trải nghiệm học tập 
            hiệu quả và thú vị nhất cho học viên.
          </Typography>
        </Box>
        
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
            Sứ mệnh của chúng tôi
          </Typography>
          
          <Typography variant="body1" paragraph>
            Sứ mệnh của LuanAcademy là giúp mọi người phát triển kỹ năng, nâng cao chuyên môn và mở ra cơ hội nghề nghiệp mới 
            thông qua các khóa học chất lượng cao với chi phí hợp lý.
          </Typography>
        </Box>
        
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
            Đội ngũ của chúng tôi
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((member) => (
              <Grid item xs={12} sm={6} md={3} key={member}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                  <Box sx={{ mb: 2, height: 200, backgroundColor: '#e0e0e0', borderRadius: 1 }}></Box>
                  <Typography variant="h6" gutterBottom>Thành viên {member}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chuyên gia với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ và giáo dục.
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default AboutPage;
