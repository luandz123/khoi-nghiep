package com.example.demo.service;

import com.example.demo.dto.ChapterDTO;
import com.example.demo.entity.Chapter;
import com.example.demo.entity.Course;
import com.example.demo.entity.Lesson;
import com.example.demo.entity.User;
import com.example.demo.repository.ChapterRepository;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.LessonCompletionRepository;
import com.example.demo.repository.LessonRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChapterService {
    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final UserRepository userRepository;
    
    public ChapterService(ChapterRepository chapterRepository, 
                         CourseRepository courseRepository,
                         LessonRepository lessonRepository,
                         LessonCompletionRepository lessonCompletionRepository,
                         UserRepository userRepository) {
        this.chapterRepository = chapterRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.lessonCompletionRepository = lessonCompletionRepository;
        this.userRepository = userRepository;
    }
    
    // Phương thức mới hỗ trợ username
    public List<ChapterDTO> getChaptersByCourse(Long courseId, String username) {
        if (username == null) {
            return getChaptersByCourse(courseId, (Long) null);
        }
        
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return getChaptersByCourse(courseId, user.getId());
    }
    
    // Các phương thức sau không thay đổi
    public ChapterDTO getChapterById(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        
        List<Lesson> lessons = lessonRepository.findByChapterIdOrderByOrder(chapter.getId());
        int totalLessons = lessons.size();
        
        return ChapterDTO.builder()
            .id(chapter.getId())
            .title(chapter.getTitle())
            .description(chapter.getDescription())
            .order(chapter.getOrder())
            .lessonsCount(totalLessons)
            .completedLessons(0) // No user info, so set to 0
            .build();
    }
    
    // Phương thức gốc với userId
    public List<ChapterDTO> getChaptersByCourse(Long courseId, Long userId) {
        List<Chapter> chapters = chapterRepository.findByCourseIdOrderByOrder(courseId);
        
        return chapters.stream().map(chapter -> {
            List<Lesson> lessons = lessonRepository.findByChapterIdOrderByOrder(chapter.getId());
            int totalLessons = lessons.size();
            
            // Tính toán số bài học đã hoàn thành nếu có userId
            int completedLessons = 0;
            if (userId != null) {
                completedLessons = (int) lessons.stream()
                    .filter(lesson -> lessonCompletionRepository.existsByUserIdAndLessonId(userId, lesson.getId()))
                    .count();
            }
            
            return ChapterDTO.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .order(chapter.getOrder())
                .lessonsCount(totalLessons)
                .completedLessons(completedLessons)
                .build();
        }).collect(Collectors.toList());
    }
    
        @Transactional
    public ChapterDTO updateChapter(Long chapterId, Chapter chapterRequest) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        
        chapter.setTitle(chapterRequest.getTitle());
        chapter.setDescription(chapterRequest.getDescription());
        
        if (chapterRequest.getOrder() != null && !chapterRequest.getOrder().equals(chapter.getOrder())) {
            // Cập nhật thứ tự
            Long courseId = chapter.getCourse().getId();
            List<Chapter> chaptersInSameCourse = chapterRepository.findByCourseIdOrderByOrder(courseId);
            
            // Sắp xếp lại thứ tự các chương
            int oldOrder = chapter.getOrder();
            int newOrder = chapterRequest.getOrder();
            
            for (Chapter c : chaptersInSameCourse) {
                if (c.getId().equals(chapterId)) continue;
                
                if (oldOrder < newOrder) {
                    // Di chuyển xuống: giảm các chương ở giữa
                    if (c.getOrder() > oldOrder && c.getOrder() <= newOrder) {
                        c.setOrder(c.getOrder() - 1);
                        chapterRepository.save(c);
                    }
                } else {
                    // Di chuyển lên: tăng các chương ở giữa
                    if (c.getOrder() >= newOrder && c.getOrder() < oldOrder) {
                        c.setOrder(c.getOrder() + 1);
                        chapterRepository.save(c);
                    }
                }
            }
            
            chapter.setOrder(newOrder);
        }
        
        chapter = chapterRepository.save(chapter);
        
        // Đếm số bài học
        List<Lesson> lessons = lessonRepository.findByChapterIdOrderByOrder(chapterId);
        
        return ChapterDTO.builder()
            .id(chapter.getId())
            .title(chapter.getTitle())
            .description(chapter.getDescription())
            .order(chapter.getOrder())
            .lessonsCount(lessons.size())
            .completedLessons(0) // Không có thông tin người dùng nên gán 0
            .build();
    }
    
    @Transactional
    public void deleteChapter(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        
        Long courseId = chapter.getCourse().getId();
        int orderToDelete = chapter.getOrder();
        
        // Xóa chương
        chapterRepository.delete(chapter);
        
        // Cập nhật thứ tự các chương sau chương bị xóa
        List<Chapter> remainingChapters = chapterRepository.findByCourseIdOrderByOrder(courseId);
        for (Chapter c : remainingChapters) {
            if (c.getOrder() > orderToDelete) {
                c.setOrder(c.getOrder() - 1);
                chapterRepository.save(c);
            }
        }
    }
    
    @Transactional
    public List<ChapterDTO> reorderChapters(List<Long> chapterIds) {
        if (chapterIds == null || chapterIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách chương không được để trống");
        }
        
        // Lấy chapter đầu tiên để xác định khóa học
        Chapter firstChapter = chapterRepository.findById(chapterIds.get(0))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        
        Long courseId = firstChapter.getCourse().getId();
        
        // Kiểm tra xem tất cả các chapter có thuộc cùng một khóa học không
        List<Chapter> chaptersToReorder = chapterRepository.findAllById(chapterIds);
        if (chaptersToReorder.size() != chapterIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Một số chương không tồn tại");
        }
        
        for (Chapter chapter : chaptersToReorder) {
            if (!chapter.getCourse().getId().equals(courseId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Tất cả các chương phải thuộc cùng một khóa học");
            }
        }
        
        // Cập nhật thứ tự
        for (int i = 0; i < chapterIds.size(); i++) {
            Long chapterId = chapterIds.get(i);
            Chapter chapter = chaptersToReorder.stream()
                .filter(c -> c.getId().equals(chapterId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Không tìm thấy chương với ID: " + chapterId));
            
            chapter.setOrder(i + 1);
            chapterRepository.save(chapter);
        }
        
        // Trả về danh sách chương đã được sắp xếp lại
        return getChaptersByCourse(courseId, (Long) null);
    }
        @Transactional
    public ChapterDTO createChapter(Chapter chapterRequest) {
        if (chapterRequest.getCourse() == null || chapterRequest.getCourse().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course ID is required");
        }
        
        Long courseId = chapterRequest.getCourse().getId();
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Tìm order cao nhất hiện tại
        List<Chapter> existingChapters = chapterRepository.findByCourseIdOrderByOrder(courseId);
        int maxOrder = existingChapters.isEmpty() ? 0 : 
            existingChapters.stream().mapToInt(Chapter::getOrder).max().orElse(0);
        
        Chapter chapter = new Chapter();
        chapter.setTitle(chapterRequest.getTitle());
        chapter.setDescription(chapterRequest.getDescription());
        chapter.setOrder(maxOrder + 1); // Thêm vào cuối
        chapter.setCourse(course);
        
        chapter = chapterRepository.save(chapter);
        
        return ChapterDTO.builder()
            .id(chapter.getId())
            .title(chapter.getTitle())
            .description(chapter.getDescription())
            .order(chapter.getOrder())
            .lessonsCount(0)
            .completedLessons(0)
            .build();
    }
    
}