package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String requestURI = request.getRequestURI();
        
        // Lấy header Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        // Kiểm tra header authorization có đúng định dạng không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Không ghi log cho các đường dẫn công khai
            if (!isPublicPath(requestURI)) {
                logger.warn("No valid Authorization header found for request to {}", requestURI);
            }
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Trích xuất token và xác thực
            jwt = authHeader.substring(7); // Cắt bỏ "Bearer "
            
            // Kiểm tra token có hợp lệ không
            if (!jwtService.validateToken(jwt)) {
                logger.warn("Invalid JWT token for request to {}", requestURI);
                filterChain.doFilter(request, response);
                return;
            }
            
            userEmail = jwtService.extractUsername(jwt);
            
            // Nếu có email và chưa xác thực
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                // Kiểm tra token có hợp lệ cho user này không
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication successful for user: {}", userEmail);
                } else {
                    logger.warn("Token validation failed for user: {}", userEmail);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing JWT token: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    // Kiểm tra xem đường dẫn có phải là công khai không
    private boolean isPublicPath(String requestURI) {
        // Các đường dẫn công khai, không cần ghi log
        return requestURI != null && (
            requestURI.startsWith("/api/auth/") || 
            requestURI.equals("/api/courses") ||
            requestURI.equals("/api/courses") || 
            requestURI.equals("/api/featured-courses") ||
            requestURI.startsWith("/api/courses/featured") ||
            requestURI.startsWith("/api/courses/by-category/") ||
            requestURI.matches("/api/courses/\\d+") ||
            requestURI.startsWith("/api/categories/")
        );
    }
}