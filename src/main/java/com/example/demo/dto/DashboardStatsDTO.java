package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStatsDTO {
    private Long totalUsers;
    private Long totalCourses;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private List<MonthlyRevenueDTO> revenueByMonth;
    private Double userChangePercentage;
    private Double courseChangePercentage;
    private Double orderChangePercentage;
    private Double revenueChangePercentage;
}