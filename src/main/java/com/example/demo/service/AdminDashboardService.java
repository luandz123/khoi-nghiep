package com.example.demo.service;

import com.example.demo.dto.DashboardStatsDTO;
import com.example.demo.dto.MonthlyRevenueDTO;
import com.example.demo.dto.OrderDTO;
import com.example.demo.entity.Order;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public DashboardStatsDTO getDashboardStats() {
        // Lấy thống kê hiện tại
        long currentTotalUsers = userRepository.count();
        long currentTotalCourses = courseRepository.count();
        long currentTotalOrders = orderRepository.count();
        BigDecimal currentTotalRevenue = orderRepository.calculateTotalRevenue();

        // Lấy thống kê tháng trước
        LocalDateTime startOfLastMonth = YearMonth.now().minusMonths(1).atDay(1).atStartOfDay();
        LocalDateTime endOfLastMonth = YearMonth.now().atDay(1).atStartOfDay();

        long lastMonthUsers = userRepository.countByCreatedAtBefore(endOfLastMonth);
        long lastMonthCourses = courseRepository.countByCreatedAtBefore(endOfLastMonth);
        long lastMonthOrders = orderRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);
        BigDecimal lastMonthRevenue = orderRepository.calculateRevenueBetween(startOfLastMonth, endOfLastMonth);

        // Tính phần trăm thay đổi
        double userChange = calculatePercentageChange(lastMonthUsers, currentTotalUsers);
        double courseChange = calculatePercentageChange(lastMonthCourses, currentTotalCourses);
        double orderChange = calculatePercentageChange(lastMonthOrders, currentTotalOrders);
        double revenueChange = calculatePercentageChange(
            lastMonthRevenue.doubleValue(), 
            currentTotalRevenue.doubleValue()
        );

        // Lấy doanh thu theo tháng
        List<MonthlyRevenueDTO> revenueByMonth = getRevenueByMonth();

        return DashboardStatsDTO.builder()
                .totalUsers(currentTotalUsers)
                .totalCourses(currentTotalCourses)
                .totalOrders(currentTotalOrders)
                .totalRevenue(currentTotalRevenue)
                .revenueByMonth(revenueByMonth)
                .userChangePercentage(userChange)
                .courseChangePercentage(courseChange)
                .orderChangePercentage(orderChange)
                .revenueChangePercentage(revenueChange)
                .build();
    }

    public List<OrderDTO> getRecentOrders() {
        List<Order> orders = orderRepository.findTop5ByOrderByCreatedAtDesc();
        return orders.stream()
                .map(order -> OrderDTO.builder()
                        .id(order.getId())
                        .customerName(order.getCustomerName())
                        .status(order.getStatus())
                        .createdAt(order.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private List<MonthlyRevenueDTO> getRevenueByMonth() {
        try {
            LocalDateTime startOfYear = YearMonth.now().withMonth(1).atDay(1).atStartOfDay();
            return orderRepository.findMonthlyRevenue(startOfYear)
                    .stream()
                    .map(data -> {
                        String month = data[0] != null ? (String) data[0] : "";
                        BigDecimal revenue = data[1] != null ? (BigDecimal) data[1] : BigDecimal.ZERO;
                        return MonthlyRevenueDTO.builder()
                                .month(month)
                                .revenue(revenue)
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log error và trả về list rỗng nếu có lỗi
            return new ArrayList<>();
        }
    }

    private double calculatePercentageChange(double oldValue, double newValue) {
        if (oldValue == 0) return newValue > 0 ? 100.0 : 0.0;
        return ((newValue - oldValue) / oldValue) * 100.0;
    }



}