package com.smartcampus.dto;

import java.time.LocalDateTime;

import com.smartcampus.entity.Role;

public class UserDto {

    private String id;
    private String name;
    private String email;
    private Role role;
    private String authProvider;
    private String phoneNumber;
    private LocalDateTime createdAt;

    public UserDto() {
    }

    public UserDto(String id, String name, String email, Role role) {
        this(id, name, email, role, null, null, null);
    }

    public UserDto(String id, String name, String email, Role role, String authProvider, String phoneNumber, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.authProvider = authProvider;
        this.phoneNumber = phoneNumber;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
