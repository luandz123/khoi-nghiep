package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Đăng ký người dùng bình thường với role mặc định là "USER"
        user.setRole("USER");
        userRepository.save(user);
    }
    
    @Transactional
    public void registerAdmin(RegisterAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        // Kiểm tra admin secret (có thể thay đổi lấy từ biến môi trường)
        if (!"ADMIN_SECRET_KEY".equals(request.getAdminSecret())) {
            throw new RuntimeException("Admin secret không hợp lệ");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Gán role "ADMIN" cho tài khoản admin
        user.setRole("ADMIN");
        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Không tìm thấy người dùng"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Mật khẩu không chính xác");
        }
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        // Trả về thông tin đăng nhập cùng role được lưu trong DB
        return new LoginResponse(token, user.getEmail(), user.getRole());
    }

    // DTO nội bộ: Dùng cho endpoint register-admin
    public static class RegisterAdminRequest {
        private String email;
        private String password;
        private String adminSecret;

        public String getEmail() {
            return email;
        }
        public void setEmail(String email) {
            this.email = email;
        }
        public String getPassword() {
            return password;
        }
        public void setPassword(String password) {
            this.password = password;
        }
        public String getAdminSecret() {
            return adminSecret;
        }
        public void setAdminSecret(String adminSecret) {
            this.adminSecret = adminSecret;
        }
    }
}