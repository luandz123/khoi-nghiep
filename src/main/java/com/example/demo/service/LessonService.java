package com.example.demo.service;

import com.example.demo.dto.LessonDTO;
import com.example.demo.dto.QuestionDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessonService {
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;
    
    public LessonService(LessonRepository lessonRepository,
                         ChapterRepository chapterRepository,
                         LessonCompletionRepository lessonCompletionRepository,
                         CourseProgressRepository courseProgressRepository,
                         QuestionRepository questionRepository,
                         ObjectMapper objectMapper) {
        this.lessonRepository = lessonRepository;
        this.chapterRepository = chapterRepository;
        this.lessonCompletionRepository = lessonCompletionRepository;
        this.courseProgressRepository = courseProgressRepository;
        this.questionRepository = questionRepository;
        this.objectMapper = objectMapper;
    }
    
    public List<LessonDTO> getLessonsByChapter(Long chapterId, Long userId) {
        List<Lesson> lessons = lessonRepository.findByChapterIdOrderByOrder(chapterId);
        
        return lessons.stream().map(lesson -> {
            Boolean completed = false;
            if (userId != null) {
                completed = lessonCompletionRepository.existsByUserIdAndLessonId(userId, lesson.getId());
            }
            
            List<QuestionDTO> questionDTOs = new ArrayList<>();
            
            // Nếu là bài quiz, lấy các câu hỏi
            if (lesson.getType() == LessonType.QUIZ) {
                List<Question> questions = questionRepository.findByLessonId(lesson.getId());
                questionDTOs = questions.stream().map(question -> {
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
            
            return LessonDTO.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .type(lesson.getType())
                .videoUrl(lesson.getVideoUrl())
                .order(lesson.getOrder())
                .completed(completed)
                .questions(questionDTOs)
                .build();
        }).collect(Collectors.toList());
    }
    
    public LessonDTO getLessonDetail(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        
        Boolean completed = false;
        if (userId != null) {
            completed = lessonCompletionRepository.existsByUserIdAndLessonId(userId, lessonId);
        }
        
        List<QuestionDTO> questionDTOs = new ArrayList<>();
        
        // Nếu là bài quiz, lấy các câu hỏi
        if (lesson.getType() == LessonType.QUIZ) {
            List<Question> questions = questionRepository.findByLessonId(lessonId);
            questionDTOs = questions.stream().map(question -> {
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
        
        return LessonDTO.builder()
            .id(lesson.getId())
            .title(lesson.getTitle())
            .type(lesson.getType())
            .videoUrl(lesson.getVideoUrl())
            .order(lesson.getOrder())
            .completed(completed)
            .questions(questionDTOs)
            .build();
    }
    
    @Transactional
    public LessonDTO createLesson(Long chapterId, Lesson lessonRequest) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        
        // Tìm order cao nhất hiện tại
        List<Lesson> existingLessons = lessonRepository.findByChapterIdOrderByOrder(chapterId);
        int maxOrder = existingLessons.isEmpty() ? 0 : 
            existingLessons.stream().mapToInt(Lesson::getOrder).max().orElse(0);
        
        Lesson lesson = new Lesson();
        lesson.setTitle(lessonRequest.getTitle());
        lesson.setType(lessonRequest.getType());
        
        // Set default empty string for videoUrl if it's null
        lesson.setVideoUrl(lessonRequest.getVideoUrl() != null ? lessonRequest.getVideoUrl() : "");
        
        lesson.setOrder(maxOrder + 1); // Thêm vào cuối
        lesson.setChapter(chapter);
        
        // Set the course from the chapter's course
        lesson.setCourse(chapter.getCourse());
        
        lesson = lessonRepository.save(lesson);
        
        return LessonDTO.builder()
            .id(lesson.getId())
            .title(lesson.getTitle())
            .type(lesson.getType())
            .videoUrl(lesson.getVideoUrl())
            .order(lesson.getOrder())
            .completed(false)
            .questions(new ArrayList<>())
            .build();
    }
    
    
        @Transactional
    public LessonDTO updateLesson(Long lessonId, Lesson lessonRequest) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        
        lesson.setTitle(lessonRequest.getTitle());
        lesson.setType(lessonRequest.getType());
        
        // Đảm bảo videoUrl không bao giờ null, thay vào đó dùng chuỗi rỗng
        lesson.setVideoUrl(lessonRequest.getVideoUrl() != null ? lessonRequest.getVideoUrl() : "");
        
        if (lessonRequest.getOrder() != null && !lessonRequest.getOrder().equals(lesson.getOrder())) {
            // Cập nhật thứ tự
            Long chapterId = lesson.getChapter().getId();
            List<Lesson> lessonsInSameChapter = lessonRepository.findByChapterIdOrderByOrder(chapterId);
            
            // Sắp xếp lại thứ tự các bài học
            int oldOrder = lesson.getOrder();
            int newOrder = lessonRequest.getOrder();
            
            for (Lesson l : lessonsInSameChapter) {
                // Giữ nguyên code hiện tại
            }
        }
        
        lesson = lessonRepository.save(lesson);
        
        List<QuestionDTO> questionDTOs = new ArrayList<>();
        
        // Nếu là bài quiz, lấy các câu hỏi
        if (lesson.getType() == LessonType.QUIZ) {
            // Giữ nguyên code hiện tại
        }
        
        return LessonDTO.builder()
            .id(lesson.getId())
            .title(lesson.getTitle())
            .type(lesson.getType())
            .videoUrl(lesson.getVideoUrl())
            .order(lesson.getOrder())
            .completed(false)
            .questions(questionDTOs)
            .build();
    }
    
    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        
        Long chapterId = lesson.getChapter().getId();
        int orderToDelete = lesson.getOrder();
        
        // Xóa bài học
        lessonRepository.delete(lesson);
        
        // Cập nhật thứ tự các bài học sau bài học bị xóa
        List<Lesson> remainingLessons = lessonRepository.findByChapterIdOrderByOrder(chapterId);
        for (Lesson l : remainingLessons) {
            if (l.getOrder() > orderToDelete) {
                l.setOrder(l.getOrder() - 1);
                lessonRepository.save(l);
            }
        }
    }
    
    @Transactional
    public void markLessonAsCompleted(Long lessonId, Long userId) {
        // Kiểm tra bài học tồn tại
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        
        // Kiểm tra người dùng đã hoàn thành bài học chưa
        boolean alreadyCompleted = lessonCompletionRepository.existsByUserIdAndLessonId(userId, lessonId);
        if (!alreadyCompleted) {
            // Tạo bản ghi hoàn thành bài học
            LessonCompletion completion = new LessonCompletion();
            User user = new User();
            user.setId(userId);
            completion.setUser(user);
            completion.setLesson(lesson);
            lessonCompletionRepository.save(completion);
            
            // Cập nhật tiến độ khóa học
            updateCourseProgress(userId, lesson.getChapter().getCourse().getId());
        }
    }
    
    @Transactional
    public void updateCourseProgress(Long userId, Long courseId) {
        // Đếm tổng số bài học trong khóa học
        long totalLessons = lessonCompletionRepository.findLessonIdsByCourseId(courseId).size();
        
        if (totalLessons == 0) return; // Không có bài học nào
        
        // Đếm số bài học đã hoàn thành
        long completedLessons = lessonCompletionRepository.countCompletedLessonsByCourseAndUser(userId, courseId);
        
        // Tính phần trăm hoàn thành
        int percentComplete = (int) ((completedLessons * 100) / totalLessons);
        
        // Cập nhật hoặc tạo mới bản ghi tiến độ
        CourseProgress progress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
            .orElse(new CourseProgress());
        
        if (progress.getId() == null) {
            User user = new User();
            user.setId(userId);
            Course course = new Course();
            course.setId(courseId);
            progress.setUser(user);
            progress.setCourse(course);
        }
        
        progress.setPercentComplete(percentComplete);
        courseProgressRepository.save(progress);
    }
}