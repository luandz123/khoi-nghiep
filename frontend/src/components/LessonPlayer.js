import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Paper, CircularProgress, Alert
} from '@mui/material';
import { 
  PlayCircle as PlayCircleIcon, 
  CheckCircle as CheckCircleIcon,
  QuestionAnswer as QuizIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';
import './LessonPlayer.css';

const LessonPlayer = ({ courseId, chapterId, initialLessonId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  
  // For quizzes
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/chapters/${chapterId}/lessons`);
        const fetchedLessons = response.data || [];
        setLessons(fetchedLessons);
        
        // Initialize the current lesson
        if (initialLessonId) {
          const lesson = fetchedLessons.find(l => l.id === parseInt(initialLessonId));
          if (lesson) {
            setCurrentLesson(lesson);
          } else if (fetchedLessons.length > 0) {
            setCurrentLesson(fetchedLessons[0]);
          }
        } else if (fetchedLessons.length > 0) {
          setCurrentLesson(fetchedLessons[0]);
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Không thể tải bài học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [chapterId, initialLessonId]);

  const handleLessonClick = (lesson) => {
    setCurrentLesson(lesson);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  const handleMarkAsCompleted = async () => {
    if (!currentLesson || currentLesson.completed) return;
    
    setCompletingLesson(true);
    try {
      await axiosInstance.post(`/lessons/${currentLesson.id}/complete`);
      
      // Update the completed status in the lesson list
      const updatedLessons = lessons.map(lesson => 
        lesson.id === currentLesson.id 
          ? { ...lesson, completed: true } 
          : lesson
      );
      
      setLessons(updatedLessons);
      setCurrentLesson({ ...currentLesson, completed: true });
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      setError('Không thể đánh dấu bài học hoàn thành. Vui lòng thử lại sau.');
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleQuizAnswerChange = (questionId, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer
    });
  };

  const handleSubmitQuiz = async () => {
    if (!currentLesson || !currentLesson.questions || currentLesson.questions.length === 0) return;
    
    setCompletingLesson(true);
    try {
      const response = await axiosInstance.post('/quizzes/submit', {
        lessonId: currentLesson.id,
        answers: quizAnswers
      });
      
      setQuizResults(response.data);
      setQuizSubmitted(true);
      
      // If the quiz is passed, update the completed status
      if (response.data.passed) {
        const updatedLessons = lessons.map(lesson => 
          lesson.id === currentLesson.id 
            ? { ...lesson, completed: true } 
            : lesson
        );
        
        setLessons(updatedLessons);
        setCurrentLesson({ ...currentLesson, completed: true });
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Không thể gửi bài quiz. Vui lòng thử lại sau.');
    } finally {
      setCompletingLesson(false);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    
    try {
      const videoId = url.includes('v=') 
        ? url.split('v=')[1].split('&')[0]
        : url.split('/').pop();
        
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentLesson) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Không có bài học nào. Vui lòng chọn chương khác hoặc quay lại sau.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="lesson-player-container">
      <Box className="lesson-sidebar">
        <Typography variant="h6" sx={{ mb: 2, p: 2, borderBottom: '1px solid #e0e0e0' }}>
          Danh sách bài học
        </Typography>
        
        <List className="lesson-list" disablePadding>
          {lessons.map((lesson) => (
            <ListItem
              key={lesson.id}
              button
              onClick={() => handleLessonClick(lesson)}
              className={`lesson-item ${currentLesson.id === lesson.id ? 'active' : ''} ${lesson.completed ? 'completed' : ''}`}
            >
              <ListItemIcon>
                {lesson.type === 'VIDEO' ? (
                  <PlayCircleIcon color={lesson.completed ? 'success' : 'primary'} />
                ) : (
                  <QuizIcon color={lesson.completed ? 'success' : 'secondary'} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={lesson.title}
                secondary={lesson.type === 'VIDEO' ? 'Video bài giảng' : 'Bài kiểm tra'}
              />
              {lesson.completed && <CheckCircleIcon color="success" />}
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Box className="lesson-content">
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          {currentLesson.title}
        </Typography>
        
        {currentLesson.type === 'VIDEO' ? (
          <>
            <Box className="video-wrapper">
              <iframe
                src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleMarkAsCompleted}
                disabled={currentLesson.completed || completingLesson}
              >
                {completingLesson ? 'Đang xử lý...' : currentLesson.completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
              </Button>
            </Box>
          </>
        ) : (
          <Box className="quiz-container">
            <Typography variant="body1" sx={{ mb: 3 }}>
              Hãy trả lời các câu hỏi dưới đây để hoàn thành bài học:
            </Typography>
            
            {quizSubmitted && quizResults && (
              <Paper elevation={0} sx={{ mb: 3, p: 3, bgcolor: quizResults.passed ? '#e8f5e9' : '#ffebee', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, color: quizResults.passed ? '#2e7d32' : '#c62828' }}>
                  {quizResults.passed ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra.' : 'Bạn chưa vượt qua bài kiểm tra.'}
                </Typography>
                <Typography variant="body1">
                  Điểm số: {quizResults.score}/100
                </Typography>
                <Typography variant="body2">
                  Trả lời đúng: {quizResults.correctAnswers}/{quizResults.totalQuestions} câu hỏi
                </Typography>
              </Paper>
            )}
            
            {currentLesson.questions && currentLesson.questions.map((question, index) => (
              <Paper 
                key={question.id} 
                elevation={0}
                sx={{ 
                  mb: 4, 
                  p: 3, 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Câu {index + 1}: {question.questionText}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                {question.options && question.options.map((option) => {
                  const isSelected = quizAnswers[question.id] === option.value;
                  const isCorrect = quizSubmitted && quizResults && quizResults.questionResults[question.id] && option.value === question.correctAnswer;
                  const isIncorrect = quizSubmitted && isSelected && !isCorrect;
                  
                  return (
                    <Box
                      key={option.value}
                      onClick={() => !quizSubmitted && handleQuizAnswerChange(question.id, option.value)}
                      className={`quiz-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: isSelected ? 'none' : '2px solid #e0e0e0',
                            backgroundColor: isSelected ? (isIncorrect ? '#ef5350' : '#6366f1') : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}
                        >
                          {isSelected && <CheckIcon fontSize="small" sx={{ color: 'white' }} />}
                        </Box>
                        <Typography variant="body1">{option.text}</Typography>
                      </Box>
                      
                      {quizSubmitted && isCorrect && (
                        <CheckCircleIcon color="success" />
                      )}
                    </Box>
                  );
                })}
              </Paper>
            ))}
            
            {!quizSubmitted && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < (currentLesson.questions?.length || 0) || completingLesson}
                >
                  {completingLesson ? 'Đang xử lý...' : 'Nộp bài'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LessonPlayer;