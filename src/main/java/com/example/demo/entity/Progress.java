package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "progress")
@Data
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã người dùng
    @Column(nullable = false)
    private Long userId;

    // Mã khóa học
    @Column(nullable = false)
    private Long courseId;

    // Mã bài học
    @Column(nullable = false)
    private Long lessonId;

    @Column(nullable = false)
    private boolean completed;
}