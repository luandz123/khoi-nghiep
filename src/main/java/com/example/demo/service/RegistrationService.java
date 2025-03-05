package com.example.demo.service;

import com.example.demo.dto.CancelRegistrationRequest;
import com.example.demo.dto.CancelRegistrationResponse;
import com.example.demo.dto.RegistrationRequest;
import com.example.demo.dto.RegistrationResponse;
import com.example.demo.entity.Course;
import com.example.demo.entity.Registration;
import com.example.demo.entity.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.RegistrationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public RegistrationService(RegistrationRepository registrationRepository, 
                               UserRepository userRepository, 
                               CourseRepository courseRepository) {
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public RegistrationResponse registerCourse(RegistrationRequest request) {
        // Convert the IDs to Long
        Long userId = Long.valueOf(request.getUserId());
        Long courseId = Long.valueOf(request.getCourseId());

        User user = userRepository.findById(userId)
                .orElse(null);
        if (user == null) {
            return new RegistrationResponse("Fail", "User not found");
        }
        Course course = courseRepository.findById(courseId)
                .orElse(null);
        if (course == null) {
            return new RegistrationResponse("Fail", "Course not found");
        }
        // Check if the user is already registered for the course
        boolean exists = registrationRepository.existsByUser_IdAndCourse_Id(userId, courseId);
        if (exists) {
            return new RegistrationResponse("Fail", "User already registered for this course");
        }
        Registration registration = new Registration();
        registration.setUser(user);
        registration.setCourse(course);
        registrationRepository.save(registration);

        return new RegistrationResponse("Success", "Đăng ký thành công");
    }

    public CancelRegistrationResponse cancelRegistration(CancelRegistrationRequest request) {
        Long userId = Long.valueOf(request.getUserId());
        Long courseId = Long.valueOf(request.getCourseId());
        return registrationRepository.findByUser_IdAndCourse_Id(userId, courseId)
                .map(registration -> {
                    registrationRepository.delete(registration);
                    return new CancelRegistrationResponse("Success", "Hủy đăng ký thành công");
                })
                .orElse(new CancelRegistrationResponse("Fail", "Đăng ký không tồn tại"));
    }
}