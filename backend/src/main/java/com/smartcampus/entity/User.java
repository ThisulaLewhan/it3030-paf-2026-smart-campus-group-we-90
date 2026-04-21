package com.smartcampus.entity;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// Represents a registered user stored in MongoDB
@Document(collection = "users")
public class User {

    @Id
    private String id;

    // Unique email used as the login username
    private String email;

    // BCrypt-hashed password – never stored in plain text
    private String password;

    // Role-based access: e.g. STUDENT, STAFF, ADMIN
    private String role;

    private String fullName;

    private LocalDateTime createdAt;

    // ── Getters & Setters ────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
