package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByFilters(
        @Param("category") String category,
        @Param("type") String type,
        @Param("search") String search,
        Pageable pageable
    );
    
    // Additional method to find featured products
    @Query(value = "SELECT p FROM Product p ORDER BY p.createdAt DESC")
    Page<Product> findFeaturedProducts(Pageable pageable);
}