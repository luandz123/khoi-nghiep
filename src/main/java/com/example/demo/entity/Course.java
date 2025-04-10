package com.example.demo.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = true, columnDefinition = "VARCHAR(255) DEFAULT 'https://placehold.co/600x400?text=No+Image'") 
    private String thumbnail;
    
    private String videoUrl;
    private String instructor;
    private String duration;
    private String level;
    private Integer studentsCount;
    
    // Thêm trường featured cho chức năng toggleFeatured
    private Boolean featured = false;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Chapter> chapters;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Đảm bảo thumbnail không null
        if (thumbnail == null) {
            thumbnail = "https://placehold.co/600x400?text=No+Image";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}