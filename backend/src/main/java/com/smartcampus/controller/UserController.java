package com.smartcampus.controller;

import com.smartcampus.dto.UpdateRoleRequestDto;
import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;
import com.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateRole(
            @PathVariable Long id, 
            @RequestBody UpdateRoleRequestDto request
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
}
