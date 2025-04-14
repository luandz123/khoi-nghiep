import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  CheckCircle as CheckIcon, 
  Share as ShareIcon,
  Fullscreen as FullscreenIcon,
  Description as DescriptionIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

const LessonPlayer = ({ lesson, onComplete, onShare }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Function to get YouTube embed URL with better parameters
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Default video if none provided
    
    try {
      let videoId = '';
      
      // Handle different YouTube URL formats
      if (url.includes('v=')) {
        videoId = url.split('v=')[1];
        // Remove any additional parameters
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1];
      } else {
        // Just in case it's just the ID
        videoId = url;
      }
      
      // Add parameters for better player experience
      return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}&widgetid=1`;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Fallback
    }
  };
  
  // Effect to simulate video loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {/* Video Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.dark', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PlayArrowIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="medium">
              Đang xem bài học
            </Typography>
          </Box>
          <Chip 
            label={lesson.completed ? "Đã hoàn thành" : "Chưa hoàn thành"} 
            size="small" 
            color={lesson.completed ? "success" : "default"}
            variant="outlined"
            sx={{ borderColor: 'white', color: 'white' }}
          />
        </Box>
        
        {/* Video Player */}
        <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
          <iframe
            src={getYoutubeEmbedUrl(lesson.content || lesson.videoUrl)}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0
            }}
            onLoad={() => setVideoLoaded(true)}
          />
          
          {!videoLoaded && (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                bgcolor: 'rgba(0,0,0,0.7)'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <PlayArrowIcon sx={{ fontSize: 60, color: 'white' }} />
              </motion.div>
              <Typography color="white" variant="body2" sx={{ mt: 2 }}>
                Đang tải video...
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Video Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              startIcon={<CheckIcon />}
              onClick={onComplete}
              disabled={lesson.completed}
              sx={{ 
                borderRadius: 6, 
                textTransform: 'none', 
                fontWeight: 'medium',
                bgcolor: lesson.completed ? 'success.main' : 'primary.main',
                '&:hover': {
                  bgcolor: lesson.completed ? 'success.dark' : 'primary.dark',
                }
              }}
            >
              {lesson.completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Chia sẻ bài học">
              <IconButton onClick={onShare} color="primary" sx={{ border: '1px solid', borderColor: 'primary.light' }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xem toàn màn hình">
              <IconButton color="primary" sx={{ border: '1px solid', borderColor: 'primary.light' }}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>
      
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DescriptionIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h5" component="h1" fontWeight="bold" color="primary.main">
            {lesson.title}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph color="text.primary" sx={{ lineHeight: 1.7 }}>
          {lesson.description || "Trong bài học này, bạn sẽ học về các khái niệm cơ bản và cách áp dụng chúng vào thực tế. Hãy xem video và làm theo các ví dụ để nắm vững kiến thức."}
        </Typography>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px dashed', borderColor: 'primary.200' }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Ghi chú:
          </Typography>
          <Typography variant="body2">
            Bạn có thể tải về tài liệu bổ sung từ tab "Tài liệu" phía dưới video.
            Nếu có câu hỏi, hãy sử dụng tab "Hỏi đáp" để trao đổi với giảng viên và các học viên khác.
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default LessonPlayer;