package com.example.demo.repository;

import com.example.demo.entity.Order;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findTop5ByOrderByCreatedAtDesc();
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(o.totalPrice) FROM Order o")
    BigDecimal calculateTotalRevenue();
    
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT CONCAT('Tháng ', MONTH(o.createdAt)) as month, SUM(o.totalPrice) as revenue FROM Order o WHERE o.createdAt >= :startDate GROUP BY MONTH(o.createdAt) ORDER BY MONTH(o.createdAt)")
    List<Object[]> findMonthlyRevenue(@Param("startDate") LocalDateTime startDate);

    /**
     * Find orders with optional status and search filters
     */
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:search IS NULL OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Order> findByFilters(@Param("status") String status, @Param("search") String search);
    
    /**
     * Find orders with optional status and search filters with sorting
     */
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:search IS NULL OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Order> findByFiltersWithSort(@Param("status") String status, @Param("search") String search, Sort sort);
}