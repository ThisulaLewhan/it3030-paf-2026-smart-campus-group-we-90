package com.smartcampus.service;

import com.smartcampus.dto.AuthResponseDto;
import com.smartcampus.dto.LoginRequestDto;
import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Authenticates a user using their email and password.
     * If successful, generates a JWT token and safely packages the user info.
     */
    public AuthResponseDto login(LoginRequestDto request) {
        
        // 1. Delegate authentication mathematically to Spring Security.
        // This will securely check the Bcrypt hash against the password automatically.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. If the above passes without throwing an exception, the user is authenticated. 
        // Fetch them from the database to construct our response.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Database lookup failed after authentication"));

        // 3. Map entity to the safe DTO (ignoring sensitive fields like password)
        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());

        // 4. Create a minimal Spring UserDetails object just to satisfy the JwtService API
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password("")
                .authorities(java.util.Collections.emptyList())
                .build();

        // 5. Generate actual token
        String jwtToken = jwtService.generateToken(userDetails);

        return new AuthResponseDto(jwtToken, userDto);
    }

    /**
     * Clean utility method to fetch the entity representing the user 
     * making the current HTTP request.
     */
    public User getCurrentlyAuthenticatedUser() {
        // Extract the principal (representing the logged-in user) from the stateless SecurityContext
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userEmail;
        
        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else {
            userEmail = principal.toString();
        }
        
        // Lookup the full entity so controllers can map it to relationships (like Notifications)
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user magically vanished from database."));
    }
}
