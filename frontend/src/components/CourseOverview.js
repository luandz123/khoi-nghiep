import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, Divider, Chip, Grid, Card,
  CardContent, Button, Avatar, Rating, LinearProgress
} from '@mui/material';
import {
  PlayCircleOutline as PlayCircleIcon,
  QuestionAnswer as QuizIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Forum as ForumIcon,
  CloudDownload as DownloadIcon,
  Note as NoteIcon,
  Timer as TimerIcon,
  BarChart as LevelIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CourseOverview = ({
  courseDetail,
  chapters,
  lessons,
  currentTab,
  expandedChapter,
  progress,
  totalLessons,
  completedLessons,
  handleTabChange,
  handleChapterClick,
  handleLessonClick
}) => {
  const [resourcesTab, setResourcesTab] = useState(0);

  // Function to get YouTube embed URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    try {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]
        : url.split('v=')[1];
        
      if (!videoId) return null;
      
      const ampersandPosition = videoId.indexOf('&');
      
      if (ampersandPosition !== -1) {
        return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
      }
      
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      console.error('Error processing YouTube URL', error);
      return null;
    }
  };

  const handleResourcesTabChange = (event, newValue) => {
    setResourcesTab(newValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Course Preview */}
      <Card sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
          {courseDetail.videoUrl ? (
            <iframe
              src={getYoutubeEmbedUrl(courseDetail.videoUrl)}
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
              title={courseDetail.title}
            />
          ) : (
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
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="body1">Không có video giới thiệu</Typography>
            </Box>
          )}
        </Box>

        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip color="primary" label={courseDetail.categoryName || 'Chưa phân loại'} size="small" />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={courseDetail.rating || 0} precision={0.5} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>{courseDetail.rating || 0}/5</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {courseDetail.title}
            </Typography>
            
            <Typography variant="body2" paragraph color="text.secondary">
              {courseDetail.description}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, mr: 1.5 }}>
                  {courseDetail.instructor?.[0] || 'I'}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Giảng viên</Typography>
                  <Typography variant="subtitle2">{courseDetail.instructor || 'Không có thông tin'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <TimerIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Thời lượng</Typography>
                  <Typography variant="subtitle2">{courseDetail.duration || 'Không xác định'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LevelIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Cấp độ</Typography>
                  <Typography variant="subtitle2">{courseDetail.level || 'Tất cả'}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PlayCircleIcon sx={{ color: 'success.main', mr: 1.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Nội dung</Typography>
                  <Typography variant="subtitle2">{totalLessons} bài học</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Progress bar for enrolled users */}
          {progress > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Tiến độ học tập
                </Typography>
                <Typography variant="body2">
                  {completedLessons}/{totalLessons} ({progress}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ height: 8, borderRadius: 5 }} 
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 120
            }
          }}
        >
          <Tab label="Nội dung khóa học" />
          <Tab label="Mô tả chi tiết" />
          <Tab label="Tài nguyên học tập" />
          <Tab label="Hỏi đáp" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box role="tabpanel" hidden={currentTab !== 0} id="course-content">
        {currentTab === 0 && (
          <Box>
            {/* Course Curriculum */}
            {chapters.map((chapter) => (
              <Accordion 
                key={chapter.id}
                expanded={expandedChapter === chapter.id}
                onChange={() => handleChapterClick(chapter.id)}
                sx={{ 
                  mb: 2, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:before': {
                    display: 'none',
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {chapter.title}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${chapter.completedLessons || 0}/${chapter.lessonsCount} hoàn thành`}
                        color={chapter.completedLessons === chapter.lessonsCount ? "success" : "primary"}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {chapter.description}
                    </Typography>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {lessons[chapter.id] ? (
                      lessons[chapter.id].map((lesson, index) => (
                        <ListItem
                          key={lesson.id}
                          button
                          onClick={() => handleLessonClick(chapter.id, lesson)}
                          divider={index < lessons[chapter.id].length - 1}
                          sx={{
                            pl: 2,
                            pr: 2,
                            py: 1,
                            bgcolor: lesson.completed ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
                            '&:hover': {
                              bgcolor: lesson.completed ? 'rgba(76, 175, 80, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {lesson.completed ? (
                              <CheckCircleIcon color="success" />
                            ) : lesson.type === 'VIDEO' ? (
                              <PlayCircleIcon color="primary" />
                            ) : (
                              <QuizIcon color="secondary" />
                            )}
                          </ListItemIcon>
                          
                          <ListItemText 
                            primary={
                              <Typography variant="body1">
                                {lesson.title}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                  {lesson.type === 'VIDEO' ? (
                                    <>
                                      <TimerIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                      {lesson.duration || '10:00'}
                                    </>
                                  ) : (
                                    <>
                                      <QuizIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                      Bài kiểm tra
                                    </>
                                  )}
                                </Typography>
                                {lesson.completed && (
                                  <Chip 
                                    size="small" 
                                    label="Hoàn thành" 
                                    color="success" 
                                    variant="outlined"
                                    sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 0.5, py: 0 } }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary={<LinearProgress sx={{ my: 1 }} />} 
                          secondary="Đang tải danh sách bài học..."
                          secondaryTypographyProps={{ align: 'center' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>

      <Box role="tabpanel" hidden={currentTab !== 1} id="course-description">
        {currentTab === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Giới thiệu khóa học
            </Typography>
            
            <Typography variant="body1" paragraph>
              {courseDetail.description || 'Không có thông tin chi tiết.'}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Bạn sẽ học được gì?
            </Typography>
            
            <List>
              {[
                "Hiểu các khái niệm cơ bản về React",
                "Xây dựng các ứng dụng web hiện đại với React",
                "Làm việc với các hook trong React",
                "Quản lý state và props hiệu quả"
              ].map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Yêu cầu
            </Typography>
            
            <List>
              {[
                "Có kiến thức cơ bản về HTML, CSS và JavaScript",
                "Hiểu về ES6 và các tính năng mới của JavaScript",
                "Máy tính có cài đặt Node.js và npm"
              ].map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Card>
        )}
      </Box>

      <Box role="tabpanel" hidden={currentTab !== 2} id="course-resources">
        {currentTab === 2 && (
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={resourcesTab} 
                onChange={handleResourcesTabChange}
                aria-label="resource tabs"
                variant="fullWidth"
              >
                <Tab label="Tài liệu" icon={<DescriptionIcon />} iconPosition="start" />
                <Tab label="Bài tập" icon={<DownloadIcon />} iconPosition="start" />
                <Tab label="Liên kết" icon={<NoteIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            <Box p={3}>
              {resourcesTab === 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Tài liệu khóa học
                  </Typography>
                  
                  <List>
                    {[
                      { name: 'Slide bài 1 - Giới thiệu React.pdf', size: '2.5 MB' },
                      { name: 'Slide bài 2 - Components và Props.pdf', size: '1.8 MB' },
                      { name: 'Slide bài 3 - State và Lifecycle.pdf', size: '2.1 MB' },
                    ].map((doc, index) => (
                      <ListItem key={index} divider={index < 2}>
                        <ListItemIcon>
                          <DescriptionIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={doc.name} 
                          secondary={`Kích thước: ${doc.size}`} 
                        />
                        <Button variant="outlined" size="small">Tải xuống</Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {resourcesTab === 1 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Bài tập và mã nguồn
                  </Typography>
                  
                  <List>
                    {[
                      { name: 'Bài tập chương 1.zip', size: '1.2 MB' },
                      { name: 'Source code demo.zip', size: '3.4 MB' },
                      { name: 'Dự án cuối khóa.zip', size: '5.6 MB' },
                    ].map((file, index) => (
                      <ListItem key={index} divider={index < 2}>
                        <ListItemIcon>
                          <DownloadIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={file.name} 
                          secondary={`Kích thước: ${file.size}`} 
                        />
                        <Button variant="outlined" size="small">Tải xuống</Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {resourcesTab === 2 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Liên kết hữu ích
                  </Typography>
                  
                  <List>
                    {[
                      { name: 'Tài liệu chính thức của React', url: 'https://reactjs.org/docs' },
                      { name: 'MDN Web Docs - JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
                      { name: 'Material-UI Documentation', url: 'https://mui.com/getting-started/usage/' },
                    ].map((link, index) => (
                      <ListItem key={index} divider={index < 2}>
                        <ListItemIcon>
                          <NoteIcon color="info" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={link.name} 
                          secondary={link.url} 
                        />
                        <Button 
                          variant="text" 
                          color="primary" 
                          href={link.url} 
                          target="_blank"
                        >
                          Mở
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Card>
        )}
      </Box>

      <Box role="tabpanel" hidden={currentTab !== 3} id="course-qa">
        {currentTab === 3 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Hỏi & đáp
                </Typography>
                <Button variant="contained" startIcon={<ForumIcon />}>
                  Đặt câu hỏi
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Chưa có câu hỏi nào cho khóa học này.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </motion.div>
  );
};

export default CourseOverview;