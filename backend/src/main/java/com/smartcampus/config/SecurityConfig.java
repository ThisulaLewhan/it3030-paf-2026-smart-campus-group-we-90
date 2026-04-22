package com.smartcampus.config;

import com.smartcampus.security.JwtFilter;
import com.smartcampus.security.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Specifically enables method-level security like @PreAuthorize("hasRole('ADMIN')")
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    public SecurityConfig(JwtFilter jwtFilter, OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
        this.jwtFilter = jwtFilter;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow the React frontend origin
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        // Allow standard HTTP methods + OPTIONS for preflight
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Explicitly allow Authorization header
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        // Allow credentials (necessary if cookies/auth headers are involved in cross-origin)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all API routes
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Enable CORS using the corsConfigurationSource bean we just defined
            .cors(Customizer.withDefaults())
            // Disable CSRF since this is a stateless REST API built for clients like React/mobile
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configure route authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow public access to all authentication endpoints (login, register)
                .requestMatchers("/api/auth/**").permitAll()
                
                // Allow OAuth2 login & callback URLs so the OAuth2 flow works without a JWT
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                
                // Allow H2 console access during development
                .requestMatchers("/h2-console/**").permitAll()
                
                // Globally secure any route starting with /api/admin/** to strictly require the ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Explicitly secure notification endpoints (accessible by anyone authenticated)
                .requestMatchers("/api/notifications/**").authenticated()
                
                // Require authentication for all other routes in the system
                .anyRequest().authenticated()
            )
            
            // Allow H2 console to render inside frames
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            
            // Enforce stateless session management (no session ID cookies on the server)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Register OAuth2 login with custom success handler to issue JWT
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2LoginSuccessHandler)
            )
            
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
