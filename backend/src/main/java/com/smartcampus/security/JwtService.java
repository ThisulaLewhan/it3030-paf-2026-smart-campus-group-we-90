package com.smartcampus.security;

import org.springframework.stereotype.Service;

// Utility class responsible for generating, decoding, and validating JWT tokens
@Service
public class JwtService {

    // Secret key for signing tokens
    private final String SECRET_KEY = "dummy-secret-key-for-development-purposes-only-replace-later";

    public String generateToken(String username) {
        // Placeholder for token generation
        return "dummy-jwt-token";
    }

    public String extractUsername(String token) {
        // Placeholder for token decoding
        return "extracted-username";
    }

    public boolean isTokenValid(String token, String username) {
        // Placeholder for token validation
        return true;
    }
}
