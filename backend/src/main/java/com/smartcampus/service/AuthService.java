package com.smartcampus.service;

import com.smartcampus.dto.AuthResponseDto;
import com.smartcampus.dto.LoginRequestDto;
import com.smartcampus.dto.RegisterRequestDto;
import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user with hashed password, assigns the default USER role,
     * then auto-generates a JWT so the user is instantly logged in after sign-up.
     */
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        // Check if email is already taken
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Create the new user entity with hashed password
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setAuthProvider("local");
        userRepository.save(user);

        // Build response DTO
        UserDto userDto = toUserDto(user);

        // Generate JWT so the user is auto-logged-in immediately
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password("")
                .authorities(Collections.emptyList())
                .build();

        String jwtToken = jwtService.generateToken(userDetails);

        return new AuthResponseDto(jwtToken, userDto);
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
        UserDto userDto = toUserDto(user);

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

    /**
     * Handles the business logic after a successful OAuth2 login.
     * Finds the user by email or creates a new one, then issues a JWT.
     */
    @Transactional
    public String processOAuthPostLogin(String email, String name) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name != null ? name : "Google User");
            // Set an empty dummy password since they log in via OAuth2
            newUser.setPassword("");
            newUser.setRole(com.smartcampus.entity.Role.USER);
            newUser.setAuthProvider("google");
            return userRepository.save(newUser);
        });

        // Generate JWT
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(Collections.singletonList(authority))
                .build();

        return jwtService.generateToken(userDetails);
    }

    public UserDto toUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAuthProvider(),
                user.getPhoneNumber(),
                user.getCreatedAt()
        );
    }
}
