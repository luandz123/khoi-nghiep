package com.example.demo.controller;

import com.example.demo.dto.QuestionDTO;
import com.example.demo.dto.QuizResultDTO;
import com.example.demo.dto.QuizSubmissionDTO;
import com.example.demo.entity.Question;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class QuizController {
    
    private final QuizService quizService;
    private final UserRepository userRepository;
    
    public QuizController(QuizService quizService, UserRepository userRepository) {
        this.quizService = quizService;
        this.userRepository = userRepository;
    }
    
    // Lấy câu hỏi quiz theo bài học - cần xác thực
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByLesson(@PathVariable Long lessonId) {
        List<QuestionDTO> questions = quizService.getQuestionsByLesson(lessonId);
        return ResponseEntity.ok(questions);
    }
    
    // Chỉ admin mới có thể tạo câu hỏi quiz
    @PostMapping("/lesson/{lessonId}/questions")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<QuestionDTO> createQuestion(@PathVariable Long lessonId,
                                                    @RequestBody Map<String, Object> requestBody) {
        Question question = new Question();
        question.setQuestionText((String) requestBody.get("questionText"));
        question.setCorrectAnswer((String) requestBody.get("correctAnswer"));
        
        @SuppressWarnings("unchecked")
        List<QuestionDTO.OptionDTO> options = (List<QuestionDTO.OptionDTO>) requestBody.get("options");
        
        QuestionDTO createdQuestion = quizService.createQuestion(lessonId, question, options);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdQuestion);
    }
    
    // Chỉ admin mới có thể cập nhật câu hỏi quiz
    @PutMapping("/questions/{questionId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Long questionId,
                                                   @RequestBody Map<String, Object> requestBody) {
        Question question = new Question();
        question.setQuestionText((String) requestBody.get("questionText"));
        question.setCorrectAnswer((String) requestBody.get("correctAnswer"));
        
        @SuppressWarnings("unchecked")
        List<QuestionDTO.OptionDTO> options = (List<QuestionDTO.OptionDTO>) requestBody.get("options");
        
        QuestionDTO updatedQuestion = quizService.updateQuestion(questionId, question, options);
        return ResponseEntity.ok(updatedQuestion);
    }
    
    // Chỉ admin mới có thể xóa câu hỏi quiz
    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        quizService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
    
    // User đã đăng nhập có thể nộp bài quiz
    @PostMapping("/submit")
    public ResponseEntity<QuizResultDTO> submitQuiz(@RequestBody QuizSubmissionDTO submission) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        QuizResultDTO result = quizService.submitQuiz(submission, user.getId());
        return ResponseEntity.ok(result);
    }
}