package com.smartcampus.controller;

import com.smartcampus.dto.AuthResponseDto;
import com.smartcampus.dto.LoginRequestDto;
import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        // Validation seamlessly kicks out bad payloads before entering the logic loop
        // BadCredentials via Service are kicked elegantly by the generic exception interceptor natively!
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        // Because /api/auth/** is configured as permitAll() inside our SecurityConfig,
        // we must manually verify the authentication context here before processing.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            User user = authService.getCurrentlyAuthenticatedUser();
            UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
            return ResponseEntity.ok(userDto);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
