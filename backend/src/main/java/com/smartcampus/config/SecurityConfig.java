package com.smartcampus.config;

import com.smartcampus.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Disable CSRF since this is a stateless REST API built for clients like React/mobile
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configure route authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow public access to all authentication endpoints (login, register)
                .requestMatchers("/api/auth/**").permitAll()
                // Explicitly secure notification endpoints
                .requestMatchers("/api/notifications/**").authenticated()
                // Require authentication for all other routes in the system
                .anyRequest().authenticated()
            )
            
            // Enforce stateless session management (no session ID cookies on the server)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Keep it ready for JWT: Insert our custom JWT filter BEFORE the standard Spring Security username/password filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            
            .build();
    }

    // Required bean for securely hashing and verifying passwords (never store plain text)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Exposes the core AuthenticationManager so it can be injected into the AuthService for processing logins
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
