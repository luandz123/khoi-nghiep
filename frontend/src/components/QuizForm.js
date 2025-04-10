import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';
import './QuizForm.css';

const QuizForm = ({ lessonId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [lessonId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/quizzes/lesson/${lessonId}`);
      setQuestions(response.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      showNotification('Không thể tải bài kiểm tra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitConfirmation = () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(question => !answers[question.id]);
    
    if (unansweredQuestions.length > 0) {
      showNotification(`Bạn còn ${unansweredQuestions.length} câu hỏi chưa trả lời`, 'warning');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setShowConfirmation(false);
    
    try {
      const response = await axiosInstance.post('/api/quizzes/submit', {
        lessonId,
        answers
      });
      
      setQuizResult(response.data);
      
      if (response.data.passed && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showNotification('Lỗi khi nộp bài kiểm tra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
    fetchQuestions();
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Không có câu hỏi cho bài kiểm tra này</Typography>
      </Paper>
    );
  }

  if (quizResult) {
    return (
      <Box className="quiz-result-container">
        <Paper elevation={3} className="quiz-result-paper">
          <Typography variant="h5" gutterBottom className="quiz-result-title">
            Kết quả bài kiểm tra
          </Typography>
          
          <Box className="quiz-result-stats">
            <Box className="quiz-result-score" sx={{ backgroundColor: quizResult.passed ? '#d1fae5' : '#fee2e2' }}>
              <Typography variant="h3" className="quiz-score-number">
                {quizResult.score}%
              </Typography>
              <Typography variant="body1">
                Điểm số
              </Typography>
            </Box>
            
            <Box className="quiz-result-details">
              <Typography variant="body1" className="quiz-result-item">
                Số câu đúng: {quizResult.correctAnswers}/{quizResult.totalQuestions}
              </Typography>
              
              <Typography variant="body1" className="quiz-result-item" sx={{
                color: quizResult.passed ? 'success.main' : 'error.main',
                fontWeight: 'bold'
              }}>
                Kết quả: {quizResult.passed ? 'Đạt' : 'Chưa đạt'}
              </Typography>
              
              {!quizResult.passed && (
                <Typography variant="body2" color="text.secondary">
                  Bạn cần đạt ít nhất 70% để hoàn thành bài kiểm tra này
                </Typography>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Chi tiết câu trả lời
          </Typography>
          
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = quizResult.questionResults[question.id];
            
            return (
              <Paper key={question.id} className="quiz-question-review" 
                sx={{ bgcolor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
              >
                <Typography variant="subtitle1" className="quiz-question-number">
                  Câu {index + 1}:
                </Typography>
                <Typography variant="body1" className="quiz-question-text">
                  {question.questionText}
                </Typography>
                
                <Box className="quiz-answer-review">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCorrect ? 'success.main' : 'error.main' }}>
                    Đáp án của bạn: {userAnswer}
                  </Typography>
                  
                  {!isCorrect && (
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      Đáp án đúng: {question.correctAnswer}
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
          
          <Box className="quiz-actions" sx={{ mt: 3 }}>
            {quizResult.passed ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onComplete}
                startIcon={<CheckCircleIcon />}
              >
                Tiếp tục học
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleRetakeQuiz}
              >
                Làm lại
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="quiz-form-container">
      <Paper elevation={3} className="quiz-form-paper">
        <Typography variant="h5" gutterBottom>
          Bài kiểm tra
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Hãy trả lời tất cả các câu hỏi bên dưới để hoàn thành bài học. Bạn cần đạt ít nhất 70% để đạt.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {questions.map((question, index) => {
          let options = [];
          try {
            options = question.options || [];
          } catch (e) {
            console.error('Error parsing options for question:', question.id, e);
          }
          
          return (
            <Box key={question.id} className="quiz-question-container">
              <Typography variant="subtitle1" className="quiz-question-number">
                Câu {index + 1}:
              </Typography>
              <Typography variant="body1" className="quiz-question-text">
                {question.questionText}
              </Typography>
              
              <FormControl component="fieldset" className="quiz-options">
                <RadioGroup
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                >
                  {options.map((option, optIndex) => (
                    <FormControlLabel
                      key={optIndex}
                      value={option.value}
                      control={<Radio />}
                      label={option.text}
                      className="quiz-option"
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          );
        })}
        
        <Box className="quiz-submit-container">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SendIcon />}
            onClick={handleSubmitConfirmation}
            disabled={submitting}
            className="quiz-submit-button"
          >
            {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
          </Button>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onClose={handleCloseConfirmation}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn nộp bài kiểm tra? Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation}>Hủy</Button>
          <Button onClick={handleSubmitQuiz} variant="contained" color="primary">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuizForm;