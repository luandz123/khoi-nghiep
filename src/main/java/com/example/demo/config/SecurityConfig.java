package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    // Các endpoint công khai
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/api/categories/**"
    };

    // Các endpoint yêu cầu xác thực
    private static final String[] AUTHENTICATED_ENDPOINTS = {
            "/api/orders/**",
            "/api/users/profile",
            "/api/courses/enroll/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
          .csrf(csrf -> csrf.disable())
          .cors(cors -> cors.configurationSource(corsConfigurationSource()))
          .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
          .authorizeHttpRequests(authorize -> authorize
                // Cho phép các request OPTIONS (pre-flight) từ client
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Public endpoints không cần xác thực
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                
                // Các endpoints GET cho courses
                .requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/courses/enroll/**").authenticated()
                
                // Các endpoints GET cho chapters
                .requestMatchers(HttpMethod.GET, "/api/chapters/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/chapters/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/chapters/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/chapters/**").hasAuthority("ADMIN")
                
                // Các endpoints GET cho lessons
                .requestMatchers(HttpMethod.GET, "/api/lessons/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/lessons/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/lessons/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/lessons/**").hasAuthority("ADMIN")
                
                // Các endpoints cho quizzes
                .requestMatchers(HttpMethod.GET, "/api/quizzes/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/quizzes/lesson/*/questions").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/quizzes/questions/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/quizzes/questions/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/quizzes/submit").authenticated()
                
                // Endpoints admin
                .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                
                // Các endpoints yêu cầu đăng nhập
                .requestMatchers(AUTHENTICATED_ENDPOINTS).authenticated()
                
                // Tất cả endpoints khác yêu cầu xác thực
                .anyRequest().authenticated()
          )
          .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}