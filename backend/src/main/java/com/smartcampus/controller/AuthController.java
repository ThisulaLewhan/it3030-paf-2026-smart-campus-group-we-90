package com.smartcampus.controller;

import com.smartcampus.dto.AuthResponseDto;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Exposes public endpoints for authentication (login and register)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody User loginRequest) {
        // Placeholder for calling authService.login()
        return ResponseEntity.ok(new AuthResponseDto());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody User registerRequest) {
        // Placeholder for calling authService.register()
        return ResponseEntity.ok(new AuthResponseDto());
    }
}
