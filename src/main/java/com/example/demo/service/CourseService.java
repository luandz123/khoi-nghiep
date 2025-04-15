package com.example.demo.service;

import com.example.demo.dto.CourseDTO;
import com.example.demo.dto.EnrollmentResponseDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.Course;
import com.example.demo.entity.User;
import com.example.demo.entity.UserCourse;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.UserCourseRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseRepository userCourseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
        // Xóa phương thức convertToDTO hiện tại và sửa các nơi gọi nó
    
    public List<CourseDTO> getNewCourses(int limit) {
        // Sắp xếp theo ID giảm dần để lấy những khóa học mới nhất
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "id"));
        List<Course> courses = courseRepository.findAll(pageable).getContent();
        
        return courses.stream()
                .map(this::mapCourseToDTO) // Sử dụng mapCourseToDTO thay vì convertToDTO
                .collect(Collectors.toList());
    }
    
    public List<CourseDTO> getFeaturedCourses() {
        List<Course> featuredCourses = courseRepository.findByFeaturedTrue();
        return featuredCourses.stream()
                .map(this::mapCourseToDTO) // Sử dụng mapCourseToDTO thay vì convertToDTO
                .collect(Collectors.toList());
    }
    
    // Xóa phương thức convertToDTO vì đã có mapCourseToDTO
    
    
    public CourseService(CourseRepository courseRepository, 
                         UserCourseRepository userCourseRepository,
                         UserRepository userRepository,
                         CategoryRepository categoryRepository) {
        this.courseRepository = courseRepository;
        this.userCourseRepository = userCourseRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        
        // Tạo thư mục uploads nếu chưa tồn tại
        createUploadDirIfNotExists();
    }
    
    private void createUploadDirIfNotExists() {
        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
                System.out.println("Created upload directory: " + uploadDir);
            }
        } catch (Exception e) {
            System.err.println("Failed to create upload directory: " + e.getMessage());
        }
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
            // Lọc khóa học dựa vào các tiêu chí
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
    @Transactional
    public CourseDTO createCourse(Course courseRequest, MultipartFile thumbnail) {
        Course course = new Course();
        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        course.setVideoUrl(courseRequest.getVideoUrl());
        course.setInstructor(courseRequest.getInstructor());
        course.setDuration(courseRequest.getDuration());
        course.setLevel(courseRequest.getLevel());
        course.setFeatured(courseRequest.getFeatured() != null ? courseRequest.getFeatured() : false);
        course.setStudentsCount(0);
        
        // Xử lý category
        if (courseRequest.getCategory() != null && courseRequest.getCategory().getId() != null) {
            Category category = categoryRepository.findById(courseRequest.getCategory().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Không tìm thấy danh mục với ID: " + courseRequest.getCategory().getId()));
            course.setCategory(category);
        }
        
        // Xử lý thumbnail
        if (thumbnail != null && !thumbnail.isEmpty()) {
            // Upload thumbnail file và lấy đường dẫn
            String thumbnailPath = saveFile(thumbnail);
            course.setThumbnail(thumbnailPath);
        } else if (courseRequest.getThumbnail() != null && !courseRequest.getThumbnail().trim().isEmpty()) {
            // Nếu không có file nhưng có URL thumbnail
            course.setThumbnail(courseRequest.getThumbnail());
        } else {
            // Nếu không có thumbnail, đặt default
            course.setThumbnail("/uploads/default-course-image.jpg");
        }
        
        course = courseRepository.save(course);
        return mapCourseToDTO(course);
    }
    
    /**
     * Phương thức xử lý cập nhật khóa học với thumbnail
     */
    @Transactional
    public CourseDTO updateCourse(Long courseId, Course courseRequest, MultipartFile thumbnail) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        
        // Cập nhật các thông tin cơ bản
        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        
        if (courseRequest.getVideoUrl() != null) {
            course.setVideoUrl(courseRequest.getVideoUrl());
        }
        
        if (courseRequest.getInstructor() != null) {
            course.setInstructor(courseRequest.getInstructor());
        }
        
        if (courseRequest.getDuration() != null) {
            course.setDuration(courseRequest.getDuration());
        }
        
        if (courseRequest.getLevel() != null) {
            course.setLevel(courseRequest.getLevel());
        }
        
        if (courseRequest.getFeatured() != null) {
            course.setFeatured(courseRequest.getFeatured());
        }
        
        // Xử lý category
        if (courseRequest.getCategory() != null && courseRequest.getCategory().getId() != null) {
            Category category = categoryRepository.findById(courseRequest.getCategory().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Không tìm thấy danh mục với ID: " + courseRequest.getCategory().getId()));
            course.setCategory(category);
        }
        
        // Xử lý thumbnail
        processCourseThumbnail(course, courseRequest, thumbnail);
        
        course = courseRepository.save(course);
        return mapCourseToDTO(course);
    }
    private void processCourseThumbnail(Course course, Course courseRequest, MultipartFile thumbnail) {
        // Nếu có file thumbnail mới
        if (thumbnail != null && !thumbnail.isEmpty()) {
            // Xóa thumbnail cũ nếu là file đã upload (không phải URL external)
            String oldThumbnail = course.getThumbnail();
            if (oldThumbnail != null && oldThumbnail.startsWith("/uploads/") 
                    && !oldThumbnail.endsWith("default-course-image.jpg")) {
                deleteFile(oldThumbnail);
            }
            
            // Upload thumbnail mới
            String thumbnailPath = saveFile(thumbnail);
            course.setThumbnail(thumbnailPath);
        } 
        // Nếu không có file mới nhưng có URL thumbnail mới
        else if (courseRequest.getThumbnail() != null && !courseRequest.getThumbnail().equals(course.getThumbnail())) {
            // Xóa thumbnail cũ nếu là file đã upload
            String oldThumbnail = course.getThumbnail();
            if (oldThumbnail != null && oldThumbnail.startsWith("/uploads/") 
                    && !oldThumbnail.endsWith("default-course-image.jpg")) {
                deleteFile(oldThumbnail);
            }
            
            course.setThumbnail(courseRequest.getThumbnail());
        }
    }
    
    /**
     * Lưu file và trả về đường dẫn tương đối
     */
    private String saveFile(MultipartFile file) {
        try {
            // Tạo thư mục upload nếu chưa tồn tại
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            // Tạo tên file ngẫu nhiên để tránh trùng lặp
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            // Đường dẫn đầy đủ đến file
            Path targetLocation = Paths.get(uploadDir).resolve(filename);
            
            // Lưu file
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Trả về đường dẫn tương đối để lưu vào DB
            return "/uploads/" + filename;
        } catch (IOException ex) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "Không thể lưu file " + file.getOriginalFilename(), 
                ex
            );
        }
    }
    
    /**
     * Xóa file từ hệ thống
     */
    private void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) return;
        
        try {
            // Chuyển đổi đường dẫn tương đối thành đường dẫn tuyệt đối
            String filename = relativePath.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir).resolve(filename);
            
            // Xóa file nếu tồn tại
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Log lỗi nhưng không ném exception
            System.err.println("Lỗi khi xóa file: " + ex.getMessage());
        }
    }

    
    
    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Xóa thumbnail nếu là file đã upload
        String thumbnail = course.getThumbnail();
        if (thumbnail != null && thumbnail.startsWith("/uploads/")) {
            deleteFile(thumbnail);
        }
        
        // Delete all enrollments first
        userCourseRepository.deleteAllByCourseId(courseId);
        
        // Delete the course
        courseRepository.deleteById(courseId);
    }
    
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
        // Placeholder để triển khai sau
        return new Object();
    }
    
    public Object getCourseEnrollments(Long courseId) {
        // Placeholder để triển khai sau
        return new Object();
    }
    
    
    
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
            .featured(course.getFeatured())
            .categoryId(course.getCategory() != null ? course.getCategory().getId() : null)
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