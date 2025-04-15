package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Đăng ký resource handler để phục vụ các file từ thư mục uploads
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            String uploadAbsolutePath = uploadPath.toString().replace("\\", "/");
            
            if (!uploadAbsolutePath.endsWith("/")) {
                uploadAbsolutePath += "/";
            }
            
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:" + uploadAbsolutePath);
                    
            System.out.println("Đã cấu hình resource handler cho uploads: " + uploadAbsolutePath);
        } catch (Exception e) {
            System.err.println("Lỗi khi cấu hình resource handler: " + e.getMessage());
        }
    }
}