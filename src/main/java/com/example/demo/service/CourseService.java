package com.example.demo.service;

import com.example.demo.dto.CourseDTO;
import com.example.demo.dto.EnrollmentResponseDTO;
import com.example.demo.entity.Course;
import com.example.demo.entity.User;
import com.example.demo.entity.UserCourse;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.UserCourseRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseRepository userCourseRepository;
    private final UserRepository userRepository;
    
    public CourseService(CourseRepository courseRepository, 
                         UserCourseRepository userCourseRepository,
                         UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userCourseRepository = userCourseRepository;
        this.userRepository = userRepository;
    }
    
    // Lấy tất cả khóa học với tùy chọn lọc
    public List<CourseDTO> getAllCourses(String search, String category, String level) {
        List<Course> courses;
        
        // Nếu không có điều kiện lọc, lấy tất cả
        if ((search == null || search.isEmpty()) && 
            (category == null || category.isEmpty()) && 
            (level == null || level.isEmpty())) {
            courses = courseRepository.findAll();
        } else {
            // TODO: Implement filtering based on search, category, and level
            // Đây là một triển khai đơn giản, bạn cần tạo một query phức tạp hơn trong repository
            courses = courseRepository.findAll().stream()
                .filter(course -> 
                    (search == null || search.isEmpty() || 
                     course.getTitle().toLowerCase().contains(search.toLowerCase()) || 
                     course.getDescription().toLowerCase().contains(search.toLowerCase())) &&
                    (category == null || category.isEmpty() || 
                     (course.getCategory() != null && 
                      course.getCategory().getName().equalsIgnoreCase(category))) &&
                    (level == null || level.isEmpty() || 
                     (course.getLevel() != null && 
                      course.getLevel().equalsIgnoreCase(level)))
                )
                .collect(Collectors.toList());
        }
        
        return mapCoursesToDTOs(courses);
    }
    
    // Lấy khóa học bằng ID
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return mapCourseToDTO(course);
    }
    
    // Lấy khóa học theo danh mục
    public List<CourseDTO> getCoursesByCategory(Long categoryId) {
        List<Course> courses = courseRepository.findByCategoryId(categoryId);
        return mapCoursesToDTOs(courses);
    }
    
    // Lấy các khóa học nổi bật
    public List<CourseDTO> getFeaturedCourses() {
        // TODO: Implement logic to get featured courses
        // This is a placeholder implementation
        List<Course> courses = courseRepository.findAll().stream()
            .limit(6) // Just get top 6 courses as featured
            .collect(Collectors.toList());
        
        return mapCoursesToDTOs(courses);
    }
    
    // Lấy khóa học của user đang đăng nhập
    public List<CourseDTO> getMyCourses(String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        List<Course> courses = userCourseRepository.findByUser(user).stream()
            .map(UserCourse::getCourse)
            .collect(Collectors.toList());
        
        return mapCoursesToDTOs(courses);
    }
    
    // Đăng ký khóa học
    @Transactional
    public EnrollmentResponseDTO enrollCourse(String username, Long courseId) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Check if already enrolled
        boolean alreadyEnrolled = userCourseRepository.existsByUserAndCourse(user, course);
        if (alreadyEnrolled) {
            return EnrollmentResponseDTO.builder()
                .success(false)
                .message("Bạn đã đăng ký khóa học này rồi")
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .build();
        }
        
        // Enroll user in course
        UserCourse userCourse = new UserCourse();
        userCourse.setUser(user);
        userCourse.setCourse(course);
        userCourseRepository.save(userCourse);
        
        // Update student count
        if (course.getStudentsCount() == null) {
            course.setStudentsCount(1);
        } else {
            course.setStudentsCount(course.getStudentsCount() + 1);
        }
        courseRepository.save(course);
        
        return EnrollmentResponseDTO.builder()
            .success(true)
            .message("Đăng ký khóa học thành công")
            .courseId(course.getId())
            .courseTitle(course.getTitle())
            .build();
    }
    
    // Kiểm tra người dùng đã đăng ký khóa học chưa
    public boolean isUserEnrolledInCourse(String username, Long courseId) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        return userCourseRepository.existsByUserAndCourse(user, course);
    }
    
    // ADMIN Methods
    
        // Trong phương thức createCourse, thêm đoạn code sau
    @Transactional
    public CourseDTO createCourse(Course courseRequest, MultipartFile thumbnail) {
        // TODO: Implement file upload for thumbnail
        Course course = new Course();
        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        course.setVideoUrl(courseRequest.getVideoUrl());
        course.setInstructor(courseRequest.getInstructor());
        course.setDuration(courseRequest.getDuration());
        course.setLevel(courseRequest.getLevel());
        course.setCategory(courseRequest.getCategory());
        course.setStudentsCount(0);
        
        // Đảm bảo thumbnail không null
        if (courseRequest.getThumbnail() == null || courseRequest.getThumbnail().trim().isEmpty()) {
            course.setThumbnail("https://placehold.co/600x400?text=No+Image");
        } else {
            course.setThumbnail(courseRequest.getThumbnail());
        }
        
        course = courseRepository.save(course);
        return mapCourseToDTO(course);
    }
    
    @Transactional
    public CourseDTO updateCourse(Long courseId, Course courseRequest, MultipartFile thumbnail) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        course.setVideoUrl(courseRequest.getVideoUrl());
        course.setInstructor(courseRequest.getInstructor());
        course.setDuration(courseRequest.getDuration());
        course.setLevel(courseRequest.getLevel());
        course.setCategory(courseRequest.getCategory());
        
        // TODO: Handle thumbnail update
        
        course = courseRepository.save(course);
        return mapCourseToDTO(course);
    }
    
    @Transactional
    public void deleteCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        
        // Delete all enrollments first
        userCourseRepository.deleteAllByCourseId(courseId);
        
        // Delete the course
        courseRepository.deleteById(courseId);
    }
    
        // Cập nhật phương thức toggleFeatured
    @Transactional
    public CourseDTO toggleFeatured(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Toggle featured status
        course.setFeatured(course.getFeatured() == null || !course.getFeatured());
        course = courseRepository.save(course);
        
        return mapCourseToDTO(course);
    }
    
    // Tạo một phiên bản overload của updateCourse không nhận thumbnail
    @Transactional
    public CourseDTO updateCourse(Long courseId, Course courseRequest) {
        return updateCourse(courseId, courseRequest, null);
    }
    
    public Object getCourseStatistics() {
        // TODO: Implement course statistics
        // This is a placeholder
        return new Object();
    }
    
    public Object getCourseEnrollments(Long courseId) {
        // TODO: Implement enrollments statistics
        // This is a placeholder
        return new Object();
    }
    
    // Helper methods
    
    private CourseDTO mapCourseToDTO(Course course) {
        if (course == null) return null;
        
        return CourseDTO.builder()
            .id(course.getId())
            .title(course.getTitle())
            .description(course.getDescription())
            .thumbnail(course.getThumbnail())
            .videoUrl(course.getVideoUrl())
            .instructor(course.getInstructor())
            .duration(course.getDuration())
            .level(course.getLevel())
            .studentsCount(course.getStudentsCount())
            .category(course.getCategory() != null ? course.getCategory().getId().toString() : null)
            .categoryName(course.getCategory() != null ? course.getCategory().getName() : null)
            .createdAt(course.getCreatedAt())
            .updatedAt(course.getUpdatedAt())
            .build();
    }
    
    private List<CourseDTO> mapCoursesToDTOs(List<Course> courses) {
        if (courses == null) return new ArrayList<>();
        
        return courses.stream()
            .map(this::mapCourseToDTO)
            .collect(Collectors.toList());
    }
}