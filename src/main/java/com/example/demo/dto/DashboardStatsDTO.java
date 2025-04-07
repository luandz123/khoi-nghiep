package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalUsers;
    private long totalCourses;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private double userChangePercentage;
    private double courseChangePercentage;
    private double orderChangePercentage;
    private double revenueChangePercentage;
    private List<MonthlyRevenueDTO> revenueByMonth;
    private List<CategoryDistributionDTO> categoryDistribution;
}