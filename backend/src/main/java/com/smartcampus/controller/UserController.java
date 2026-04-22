package com.smartcampus.controller;

import com.smartcampus.dto.UpdateProfileRequestDto;
import com.smartcampus.dto.UpdateRoleRequestDto;
import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.UserService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers().stream()
                .map(authService::toUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateRole(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateRoleRequestDto request
    ) {
        // Execeptions are securely intercepted by GlobalExceptionHandler universally natively via proxy!
        User updatedUser = userService.updateUserRole(id, request.getRole());
        
        UserDto userDto = new UserDto(
                updatedUser.getId(), 
                updatedUser.getName(), 
                updatedUser.getEmail(), 
                updatedUser.getRole()
        );
        
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUserProfile(@Valid @RequestBody UpdateProfileRequestDto request) {
        User updatedUser = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(authService.toUserDto(updatedUser));
    }
}
