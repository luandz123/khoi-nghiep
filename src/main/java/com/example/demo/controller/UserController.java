package com.example.demo.controller;

import com.example.demo.dto.EnrolledCourseDto;
import com.example.demo.dto.UpdateUserRequest;
import com.example.demo.dto.UpdateUserResponse;
import com.example.demo.dto.UserInfoDto;
import com.example.demo.entity.Registration;
import com.example.demo.entity.User;
import com.example.demo.repository.RegistrationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;

    public UserController(UserRepository userRepository, RegistrationRepository registrationRepository) {
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
    }

    @GetMapping("/info")
    public ResponseEntity<UserInfoDto> getUserInfo(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Registration> registrations = registrationRepository.findByUser_Id(user.getId());
        List<EnrolledCourseDto> enrolledCourses = registrations.stream().map(registration -> {
            EnrolledCourseDto dto = new EnrolledCourseDto();
            dto.setCourseId(registration.getCourse().getId());
            dto.setTitle(registration.getCourse().getTitle());
            return dto;
        }).collect(Collectors.toList());

        UserInfoDto userInfo = new UserInfoDto();
        userInfo.setName(user.getName());
        userInfo.setEmail(user.getEmail());
        userInfo.setAvatar(user.getAvatar() != null ? user.getAvatar() : "https://via.placeholder.com/150");
        userInfo.setEnrolledCourses(enrolledCourses);

        return ResponseEntity.ok(userInfo);
    }

    @PutMapping("/update")
    public ResponseEntity<UpdateUserResponse> updateUser(@RequestBody UpdateUserRequest updateRequest,
                                                         Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String currentEmail = authentication.getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Nếu bạn cho phép cập nhật email, hãy kiểm tra trùng lặp hoặc chuyển đổi token nếu cần.
        // Ví dụ: nếu muốn giữ định danh, có thể bỏ cập nhật email:
        user.setName(updateRequest.getName());
        // Giữ nguyên email để không làm mất kết nối của người dùng
        // user.setEmail(updateRequest.getEmail());
        user.setAvatar(updateRequest.getAvatar());
        
        userRepository.save(user);
        return ResponseEntity.ok(new UpdateUserResponse("Success"));
    }
}