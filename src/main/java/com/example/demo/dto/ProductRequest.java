package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    private Integer stock;

    @NotBlank(message = "Danh mục không được để trống")
    private String category;

    private String description;
    
    // URL được lưu trong DB để hiển thị ảnh sản phẩm
    private String imageUrl;

    // File ảnh được upload từ form (không lưu vào DB)
    private MultipartFile imageFile;
}