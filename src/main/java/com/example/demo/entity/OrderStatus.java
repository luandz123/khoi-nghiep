package com.example.demo.entity;

public enum OrderStatus {
    PENDING,    // Chờ duyệt
    PAID,       // Đã thanh toán
    SHIPPED,    // Đang giao
    COMPLETED,  // Hoàn tất
    CANCELLED   // Đã hủy
}