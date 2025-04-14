package com.example.demo.entity;

import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "lessons")
@Data
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Enumerated(EnumType.STRING)
    private LessonType type; // VIDEO, QUIZ
    
    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String videoUrl;
    
    @Column(name = "order_index")
    private Integer order;
    
    @ManyToOne
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;
    
    // Add this field to match your database schema
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
    
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<Question> questions;
}