/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, 
  FormHelperText, Card, CardContent, CircularProgress, Divider, Alert,
  LinearProgress, Stepper, Step, StepLabel, StepButton, Badge, Grid, Paper, Tooltip, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowBack as ArrowBackIcon, 
  CheckCircle as CheckIcon, 
  Send as SendIcon,
  Flag as FlagIcon,
  ArrowForward as ArrowForwardIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosConfig';

const QuizPlayer = ({ lesson, onBack, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Fetch quiz questions from API based on QuizController
  useEffect(() => {
    const fetchQuizQuestions = async () => {
      try {
        setLoading(true);
        // API endpoint matches QuizController: /api/quizzes/lesson/{lessonId}
        const response = await axiosInstance.get(`/quizzes/lesson/${lesson.id}`);
        
        console.log("API Response:", response.data);
        
        // API returns List<QuestionDTO>
        const questionsData = Array.isArray(response.data) ? response.data : [];
        
        // Đảm bảo rằng dữ liệu có cấu trúc đúng
        const processedQuestions = questionsData.map(q => {
          // Normalize question structure
          let questionText = q.questionText || q.question || '';
          if (typeof questionText === 'object' && questionText.text) {
            questionText = questionText.text;
          }
          
          // QUAN TRỌNG: Normalize options và đảm bảo ID là index
          let options = [];
          if (Array.isArray(q.options)) {
            options = q.options.map((opt, index) => {
              // Luôn dùng index làm ID để đảm bảo khớp với correctAnswer từ backend
              return {
                id: String(index),  // Convert index thành string để đồng nhất
                text: typeof opt === 'string' ? opt : (opt.text || '')
              };
            });
          }
          
          // Đảm bảo correctAnswer là string
          const correctAnswer = q.correctAnswer !== undefined ? String(q.correctAnswer) : '';
          
          console.log(`Question ID ${q.id}: correctAnswer = ${correctAnswer}`);
          
          return {
            id: q.id,
            questionText,
            options,
            correctAnswer,
            explanation: q.explanation || ''
          };
        });
        
        console.log("Processed Questions:", processedQuestions);
        
        setQuestions(processedQuestions);
        
        // Initialize answers object
        const initialAnswers = {};
        processedQuestions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        setError('Không thể tải câu hỏi quiz. Vui lòng thử lại sau.');
        
        // Mock data for testing when API fails
        const mockQuestions = [
          {
            id: 1,
            questionText: 'React được phát triển bởi công ty nào?',
            options: [
              { id: '0', text: 'Google' },
              { id: '1', text: 'Facebook' },
              { id: '2', text: 'Amazon' },
              { id: '3', text: 'Microsoft' }
            ],
            correctAnswer: '1', // Facebook - index based 
            explanation: 'React là thư viện JavaScript được phát triển bởi Facebook.'
          },
          {
            id: 2,
            questionText: 'JSX là viết tắt của?',
            options: [
              { id: '0', text: 'JavaScript XML' },
              { id: '1', text: 'JavaScript Extension' },
              { id: '2', text: 'JavaScript Syntax' },
              { id: '3', text: 'Java Syntax XML' }
            ],
            correctAnswer: '0', // JavaScript XML - index based
            explanation: 'JSX là cú pháp mở rộng cho JavaScript, viết tắt của JavaScript XML.'
          },
          {
            id: 3,
            questionText: 'Đâu không phải là hook trong React?',
            options: [
              { id: '0', text: 'useState' },
              { id: '1', text: 'useEffect' },
              { id: '2', text: 'useContext' },
              { id: '3', text: 'useRepeat' }
            ],
            correctAnswer: '3', // useRepeat - index based
            explanation: 'useRepeat không phải là hook có sẵn trong React. Các hook chuẩn bao gồm useState, useEffect, useContext, useReducer và một số hook khác.'
          }
        ];
        
        setQuestions(mockQuestions);
        
        // Initialize answers object for mock data
        const initialAnswers = {};
        mockQuestions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizQuestions();
  }, [lesson.id]);

  const handleAnswerChange = (questionId, value) => {
    console.log(`Selecting answer for question ${questionId}: ${value}`);
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  // Submit quiz answers - matching API in QuizController
  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      // Prepare the answers object to match QuizSubmissionDTO format
      const formattedAnswers = {};
      
      Object.keys(answers).forEach(key => {
        formattedAnswers[key] = answers[key];
      });
      
      console.log("Submitting answers:", {
        lessonId: lesson.id,
        answers: formattedAnswers
      });
      
      // QuizController expects QuizSubmissionDTO with lessonId and answers
      const response = await axiosInstance.post('/quizzes/submit', {
        lessonId: lesson.id,
        answers: formattedAnswers  // Map<Long, String> (key: questionId, value: selectedOptionId)
      });
      
      console.log("Submission response:", response.data);
      
      setScore(response.data);
      setSubmitted(true);
      
      // Mark lesson as complete if passed
      if (response.data.passed) {
        onComplete && onComplete();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Có lỗi khi nộp bài. Vui lòng thử lại sau.');
      
      // Mock result for testing when API fails
      const mockResults = {};
      let correctCount = 0;
      
      questions.forEach(q => {
        const isCorrect = answers[q.id] === q.correctAnswer;
        mockResults[q.id] = isCorrect;
        if (isCorrect) correctCount++;
      });
      
      const mockScore = {
        score: Math.round((correctCount / questions.length) * 100),
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        passed: correctCount >= Math.ceil(questions.length * 0.7),
        questionResults: mockResults
      };
      
      setScore(mockScore);
      setSubmitted(true);
      
      // Mark lesson as complete if passed
      if (mockScore.passed) {
        onComplete && onComplete();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    // Reset answers
    const initialAnswers = {};
    questions.forEach(q => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
    setSubmitted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
    setFlaggedQuestions({});
  };

  // Navigation functions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const navigateToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  const toggleFlaggedQuestion = (questionId) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Calculate score from API response or mock data
  const calculateScore = () => {
    if (!score) return { percentage: 0, correct: 0, total: questions.length };
    
    const correct = score.correctAnswers || 0;
    const total = score.totalQuestions || questions.length;
    const percentage = Math.round((correct / total) * 100);
    
    return {
      percentage: percentage,
      correct: correct,
      total: total,
      passed: percentage >= 70
    };
  };
  
  const scoreData = calculateScore();
  const answeredCount = Object.values(answers).filter(a => a !== '').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 'medium' }}>Đang tải câu hỏi...</Typography>
      </Box>
    );
  }

  // Results view after submission
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            Quay lại
          </Button>
          <Typography variant="h5" fontWeight="bold">Kết quả bài kiểm tra</Typography>
          <Box width={100} />
        </Box>
        
        <Card sx={{ mb: 4, overflow: 'hidden', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Box sx={{ 
            bgcolor: scoreData.passed ? 'success.main' : 'warning.main',
            color: 'white',
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {scoreData.passed ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra.' : 'Bạn cần cố gắng hơn!'}
            </Typography>
            <Typography variant="body1">
              {scoreData.passed 
                ? 'Bạn đã đạt điểm số tối thiểu để vượt qua bài kiểm tra này.' 
                : 'Bạn cần đạt ít nhất 70% để vượt qua bài kiểm tra.'}
            </Typography>
          </Box>
          
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={scoreData.percentage} 
                  size={180} 
                  thickness={6}
                  color={scoreData.passed ? "success" : "warning"}
                  sx={{ boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h2" component="div" fontWeight="bold">
                    {`${scoreData.percentage}%`}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Điểm của bạn
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Bạn đã trả lời đúng {scoreData.correct}/{scoreData.total} câu hỏi
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <Button 
                variant="outlined"
                size="large" 
                onClick={resetQuiz}
                startIcon={<TimerIcon />}
                sx={{ borderRadius: 8, px: 4 }}
              >
                Làm lại
              </Button>
              
              {scoreData.passed && (
                <Button 
                  variant="contained" 
                  color="success" 
                  size="large"
                  startIcon={<CheckIcon />}
                  onClick={onBack}
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  Tiếp tục
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
        
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 5, mb: 3 }}>
          Xem lại câu trả lời của bạn
        </Typography>
        
        <AnimatePresence>
          {questions.map((question, index) => {
            // Determine if answer was correct
            const userAnswer = answers[question.id];
            const correctAnswer = question.correctAnswer;
            
            // First check questionResults from backend, then fallback to local comparison
            let isCorrect = false;
            if (score && score.questionResults && score.questionResults[question.id] !== undefined) {
              isCorrect = score.questionResults[question.id];
            } else {
              isCorrect = userAnswer === correctAnswer;
            }
            
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
                }}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: isCorrect ? 'success.light' : 'error.light',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Câu {index + 1}: {question.questionText || question.question}
                    </Typography>
                    {isCorrect ? (
                      <CheckIcon />
                    ) : (
                      <WarningIcon />
                    )}
                  </Box>
                  
                  <CardContent>
                    <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                      <RadioGroup value={userAnswer}>
                        {(question.options || []).map((option) => {
                          // Safety checks for option structure
                          if (!option) return null;
                          
                          const optionId = option.id?.toString() || '';
                          const correctAns = correctAnswer?.toString() || '';
                          const isCorrectOption = optionId === correctAns;
                          const isSelected = userAnswer === optionId;
                          
                          return (
                            <FormControlLabel
                              key={optionId || Math.random()}
                              disabled
                              value={optionId}
                              control={
                                <Radio 
                                  color={isCorrectOption ? "success" : (isSelected && !isCorrectOption) ? "error" : "default"}
                                  checked={isSelected}
                                />
                              }
                              label={
                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 1, 
                                  borderRadius: '4px',
                                  bgcolor: isCorrectOption ? 'rgba(76, 175, 80, 0.1)' : 
                                        (isSelected && !isCorrectOption) ? 'rgba(244, 67, 54, 0.1)' : 
                                        'transparent'
                                }}>
                                  <Typography
                                    sx={{
                                      fontWeight: isCorrectOption || isSelected ? 'bold' : 'normal',
                                      color: isCorrectOption ? 'success.main' : 
                                           (isSelected && !isCorrectOption) ? 'error.main' : 'text.primary'
                                    }}
                                  >
                                    {option.text || ''}
                                    {isCorrectOption && ' ✓'}
                                  </Typography>
                                </Box>
                              }
                              sx={{ 
                                mb: 1,
                                width: '100%'
                              }}
                            />
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    
                    {/* Explanation section */}
                    {question.explanation && (
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'info.light', 
                        borderRadius: '4px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1
                      }}>
                        <InfoIcon sx={{ mt: 0.5 }} />
                        <Typography variant="body2">
                          <strong>Giải thích:</strong> {question.explanation}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pb: 4 }}>
          <Button 
            variant="outlined" 
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
          >
            Quay lại
          </Button>
          
          <Button 
            variant="outlined"
            onClick={resetQuiz}
            startIcon={<TimerIcon />}
          >
            Làm lại bài kiểm tra
          </Button>
        </Box>
      </motion.div>
    );
  }

  // Taking quiz view - with "one question at a time" UX
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
        >
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold" color="primary.dark">
          {lesson.title || 'Bài kiểm tra'}
        </Typography>
        <Box width={100} />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Progress bar */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tiến độ làm bài
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ minWidth: 80 }}>
                {answeredCount}/{questions.length} câu
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(answeredCount / questions.length) * 100}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" fontWeight="bold" color="primary.main">
                {Math.round((answeredCount / questions.length) * 100)}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Question navigation */}
      <Box sx={{ mb: 4, pb: 1, overflowX: 'auto' }}>
        <Stepper 
          activeStep={currentQuestionIndex} 
          nonLinear 
          alternativeLabel
          sx={{ minWidth: questions.length * 100 }}
        >
          {questions.map((question, index) => {
            const isAnswered = answers[question.id] !== '';
            const isFlagged = flaggedQuestions[question.id];
            
            return (
              <Step key={question.id} completed={isAnswered}>
                <StepButton 
                  onClick={() => navigateToQuestion(index)}
                  sx={{
                    '& .MuiStepLabel-iconContainer': {
                      '& .MuiStepIcon-text': {
                        fill: 'white',
                      },
                    },
                  }}
                >
                  <Badge 
                    color={isFlagged ? "error" : "default"}
                    variant={isFlagged ? "dot" : "standard"}
                    overlap="circular"
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: currentQuestionIndex === index ? 'bold' : 'normal',
                        color: isAnswered ? 'success.main' : 'text.primary'
                      }}
                    >
                      Câu {index + 1}
                    </Typography>
                  </Badge>
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
      </Box>

      {/* Current Question */}
      {questions[currentQuestionIndex] && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Câu {currentQuestionIndex + 1}: {questions[currentQuestionIndex].questionText}
                </Typography>
                
                <Tooltip title={flaggedQuestions[questions[currentQuestionIndex].id] ? "Bỏ đánh dấu" : "Đánh dấu xem lại"}>
                  <IconButton 
                    size="small"
                    onClick={() => toggleFlaggedQuestion(questions[currentQuestionIndex].id)}
                    color={flaggedQuestions[questions[currentQuestionIndex].id] ? "error" : "default"}
                  >
                    <FlagIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[questions[currentQuestionIndex].id] || ''}
                  onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                >
                  {(questions[currentQuestionIndex].options || []).map((option) => {
                    // Add safety check
                    if (!option) return null;
                    
                    const optionId = option.id?.toString() || '';
                    const isSelected = answers[questions[currentQuestionIndex].id] === optionId;
                    
                    return (
                      <motion.div
                        key={optionId || Math.random()}
                        whileHover={{ scale: 1.01 }}
                      >
                        <FormControlLabel
                          value={optionId}
                          control={<Radio />}
                          label={option.text || ''}
                          sx={{ 
                            p: 2,
                            borderRadius: 2, 
                            width: '100%',
                            mb: 1.5,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : '#e0e0e0',
                            bgcolor: isSelected ? 'primary.50' : 'background.paper',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: isSelected ? 'primary.100' : 'action.hover',
                              borderColor: isSelected ? 'primary.main' : 'primary.light'
                            }
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </RadioGroup>
                
                {answers[questions[currentQuestionIndex]?.id] === '' && (
                  <FormHelperText>Vui lòng chọn một đáp án</FormHelperText>
                )}
              </FormControl>
            </Paper>
          </motion.div>
        </AnimatePresence>
      )}
      
      {/* Question Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          sx={{ borderRadius: 8, px: 3 }}
        >
          Câu trước
        </Button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNextQuestion}
            sx={{ borderRadius: 8, px: 3 }}
          >
            Câu tiếp theo
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<SendIcon />}
            onClick={handleSubmitQuiz}
            disabled={submitting || Object.values(answers).some(a => a === '')}
            sx={{ borderRadius: 8, px: 4 }}
          >
            {submitting ? 'Đang xử lý...' : 'Nộp bài'}
          </Button>
        )}
      </Box>
      
      {/* Submit Button and Summary */}
      <Paper elevation={1} sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Đã trả lời</Typography>
                <Typography variant="h6" color={answeredCount === questions.length ? "success.main" : "text.primary"}>
                  {answeredCount}/{questions.length}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Đã đánh dấu</Typography>
                <Typography variant="h6" color="warning.main">
                  {Object.values(flaggedQuestions).filter(Boolean).length}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">Còn lại</Typography>
                <Typography variant="h6" color="error.main">
                  {questions.length - answeredCount}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<SendIcon />}
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.values(answers).some(a => a === '')}
              sx={{ borderRadius: 8, px: 4 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Đang xử lý...
                </>
              ) : (
                'Nộp bài'
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default QuizPlayer;