package com.example.demo.service;

import com.example.demo.dto.PurchaseRequest;
import com.example.demo.entity.Course;
import com.example.demo.entity.Purchase;
import com.example.demo.entity.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.PurchaseRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public void purchaseCourse(PurchaseRequest request) {
        // Check if already purchased
        if (purchaseRepository.existsByUserIdAndCourseId(request.getUserId(), request.getCourseId())) {
            throw new RuntimeException("Bạn đã mua khóa học này rồi!");
        }

        // Get user and course
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học!"));

        // Create purchase
        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setCourse(course);

        purchaseRepository.save(purchase);
    }
}