package com.example.demo.service;

import com.example.demo.dto.UserLockRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public UserResponse updateUserRole(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng!"));

        if (!request.getRole().equals("ADMIN") && !request.getRole().equals("USER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role không hợp lệ!");
        }
        user.setRole(request.getRole());
        userRepository.save(user);

        return UserResponse.builder()
            .message("Người dùng đã được cập nhật")
            .userId(user.getId())
            .role(user.getRole())
            .locked(user.isLocked())
            .build();
    }

    @Transactional
    public UserResponse updateUserLockStatus(Long id, UserLockRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng!"));
        user.setLocked(request.isLocked());
        userRepository.save(user);
        return UserResponse.builder()
            .message("Người dùng đã được cập nhật")
            .userId(user.getId())
            .role(user.getRole())
            .locked(user.isLocked())
            .build();
    }
}