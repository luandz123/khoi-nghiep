package com.example.demo.service;

import com.example.demo.dto.QuestionDTO;
import com.example.demo.dto.QuizResultDTO;
import com.example.demo.dto.QuizSubmissionDTO;
import com.example.demo.entity.Lesson;
import com.example.demo.entity.LessonCompletion;
import com.example.demo.entity.Question;
import com.example.demo.entity.User;
import com.example.demo.repository.LessonCompletionRepository;
import com.example.demo.repository.LessonRepository;
import com.example.demo.repository.QuestionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizService {
    private final QuestionRepository questionRepository;
    private final LessonRepository lessonRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final LessonService lessonService;
    private final ObjectMapper objectMapper;
    
    public QuizService(QuestionRepository questionRepository,
                       LessonRepository lessonRepository,
                       LessonCompletionRepository lessonCompletionRepository,
                       LessonService lessonService,
                       ObjectMapper objectMapper) {
        this.questionRepository = questionRepository;
        this.lessonRepository = lessonRepository;
        this.lessonCompletionRepository = lessonCompletionRepository;
        this.lessonService = lessonService;
        this.objectMapper = objectMapper;
    }
    
    public List<QuestionDTO> getQuestionsByLesson(Long lessonId) {
        List<Question> questions = questionRepository.findByLessonId(lessonId);
        
        return questions.stream().map(question -> {
            List<QuestionDTO.OptionDTO> options = new ArrayList<>();
            try {
                if (question.getOptions() != null) {
                    options = objectMapper.readValue(question.getOptions(), 
                        new TypeReference<List<QuestionDTO.OptionDTO>>() {});
                }
            } catch (JsonProcessingException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Error parsing question options");
            }
            
            return QuestionDTO.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .options(options)
                .build();
        }).collect(Collectors.toList());
    }
    
    @Transactional
    public QuestionDTO createQuestion(Long lessonId, Question questionRequest, List<QuestionDTO.OptionDTO> options) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        
        Question question = new Question();
        question.setQuestionText(questionRequest.getQuestionText());
        question.setCorrectAnswer(questionRequest.getCorrectAnswer());
        question.setLesson(lesson);
        
        try {
            question.setOptions(objectMapper.writeValueAsString(options));
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error serializing question options");
        }
        
        question = questionRepository.save(question);
        
        return QuestionDTO.builder()
            .id(question.getId())
            .questionText(question.getQuestionText())
            .options(options)
            .build();
    }
    
    @Transactional
    public QuestionDTO updateQuestion(Long questionId, Question questionRequest, List<QuestionDTO.OptionDTO> options) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        
        question.setQuestionText(questionRequest.getQuestionText());
        question.setCorrectAnswer(questionRequest.getCorrectAnswer());
        
        try {
            question.setOptions(objectMapper.writeValueAsString(options));
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error serializing question options");
        }
        
        question = questionRepository.save(question);
        
        return QuestionDTO.builder()
            .id(question.getId())
            .questionText(question.getQuestionText())
            .options(options)
            .build();
    }
    
    @Transactional
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }
    
    @Transactional
    public QuizResultDTO submitQuiz(QuizSubmissionDTO submission, Long userId) {
        Lesson lesson = lessonRepository.findById(submission.getLessonId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        
        List<Question> questions = questionRepository.findByLessonId(lesson.getId());
        
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No questions found for this quiz");
        }
        
        // Kiểm tra đáp án
        int correctAnswers = 0;
        Map<Long, Boolean> questionResults = new HashMap<>();
        
        for (Question question : questions) {
            String userAnswer = submission.getAnswers().get(question.getId());
            boolean isCorrect = userAnswer != null && userAnswer.equals(question.getCorrectAnswer());
            
            if (isCorrect) {
                correctAnswers++;
            }
            
            questionResults.put(question.getId(), isCorrect);
        }
        
        // Tính điểm
        int score = (int) ((correctAnswers * 100.0) / questions.size());
        
        // Quy định là hoàn thành nếu điểm >= 70%
        boolean passed = score >= 70;
        
        // Nếu đạt thì đánh dấu bài học hoàn thành
        if (passed) {
            // Check if already completed
            if (!lessonCompletionRepository.existsByUserIdAndLessonId(userId, lesson.getId())) {
                LessonCompletion completion = new LessonCompletion();
                User user = new User();
                user.setId(userId);
                completion.setUser(user);
                completion.setLesson(lesson);
                completion.setScore(score);
                lessonCompletionRepository.save(completion);
                
                // Cập nhật tiến độ khóa học
                lessonService.updateCourseProgress(userId, lesson.getChapter().getCourse().getId());
            } else {
                // Cập nhật điểm nếu điểm cao hơn
                lessonCompletionRepository.findByUserIdAndLessonId(userId, lesson.getId())
                    .ifPresent(completion -> {
                        if (completion.getScore() == null || score > completion.getScore()) {
                            completion.setScore(score);
                            lessonCompletionRepository.save(completion);
                        }
                    });
            }
        }
        
        return QuizResultDTO.builder()
            .score(score)
            .totalQuestions(questions.size())
            .correctAnswers(correctAnswers)
            .passed(passed)
            .questionResults(questionResults)
            .build();
    }
}