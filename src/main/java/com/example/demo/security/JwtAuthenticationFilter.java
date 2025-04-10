package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Bỏ qua request OPTIONS (pre-flight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Bỏ qua các endpoint công khai không cần xác thực
        if (path.startsWith("/api/auth/") || 
            path.startsWith("/api/progress/") || 
            path.startsWith("/api/categories/")) {
            logger.debug("Bypassing JWT filter for public endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Bỏ qua các endpoint GET cho courses
        if (method.equals("GET") && path.startsWith("/api/courses/")) {
            logger.debug("Bypassing JWT filter for public course endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Bỏ qua các endpoint GET cho chapters
        if (method.equals("GET") && 
            (path.startsWith("/api/chapters/") || path.matches("/api/chapters/course/\\d+"))) {
            logger.debug("Bypassing JWT filter for public chapter endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Bỏ qua các endpoint GET cho lessons
        if (method.equals("GET") && path.startsWith("/api/lessons/")) {
            logger.debug("Bypassing JWT filter for public lesson endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Xử lý token JWT cho các route khác
        final String authHeader = request.getHeader("Authorization");
        logger.debug("Request to {} with auth header: {}", path, 
            authHeader != null ? (authHeader.startsWith("Bearer ") ? "Bearer ..." : authHeader) : "null");
            
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            logger.warn("No valid Authorization header found for request to {}", path);
            
            // Nếu request yêu cầu POST/PUT đến lessons/quizzes, không được bỏ qua
            if ((path.startsWith("/api/lessons/") || path.startsWith("/api/quizzes/")) && 
                (method.equals("POST") || method.equals("PUT") || method.equals("DELETE"))) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Authentication required");
                return;
            }
            
            // Tiếp tục cho các endpoint khác
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String jwt = authHeader.substring(7);
            logger.debug("Extracted JWT token for endpoint {}: {}", path, jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
            
            String userEmail = jwtService.extractUsername(jwt);
            logger.debug("Extracted username from token: {}", userEmail);
            
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                
                // Trích xuất roles từ JWT
                List<String> roles = jwtService.extractRoles(jwt);
                logger.debug("Extracted roles from token: {}", roles);
                
                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Tạo authentication với authorities từ JWT
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    logger.debug("Authentication set for user: {}, authorities: {}", userEmail, authorities);
                } else {
                    logger.warn("Token validation failed for user: {}", userEmail);
                }
            }
        } catch (Exception e) {
            logger.error("Authentication error: {} for path: {}", e.getMessage(), path);
        }
        
        filterChain.doFilter(request, response);
    }
}