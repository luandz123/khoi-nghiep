package com.example.demo.dto;

import com.example.demo.entity.LessonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDTO {
    private Long id;
    private String title;
    private LessonType type;
    private String videoUrl;
    private Integer order;
    private Boolean completed;
    private List<QuestionDTO> questions;
}