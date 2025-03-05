package com.example.demo.service;

import com.example.demo.entity.Progress;
import com.example.demo.repository.ProgressRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;

    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public Progress saveProgress(Progress progress) {
        return progressRepository.save(progress);
    }
    
    // Phương thức mới để lấy tiến độ theo userId và courseId
    public List<Progress> getProgressByUserAndCourse(Long userId, Long courseId) {
        return progressRepository.findByUserIdAndCourseId(userId, courseId);
    }
}