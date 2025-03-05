package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserInfoDto {
    private String name;
    private String email;
    private String avatar;
    private List<EnrolledCourseDto> enrolledCourses;
}