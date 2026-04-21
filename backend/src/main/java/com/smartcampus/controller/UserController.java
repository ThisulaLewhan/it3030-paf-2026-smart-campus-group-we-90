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

    /**
     * Endpoint reserved explicitly for administrators to update other user's roles.
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')") // This leverages the @EnableMethodSecurity we set up!
    public ResponseEntity<?> updateRole(
            @PathVariable Long id, 
            @RequestBody UpdateRoleRequestDto request
    ) {
        try {
            User updatedUser = userService.updateUserRole(id, request.getRole());
            
            // Map the fresh database entity directly to a public DTO
            // We do this to meticulously ensure we never leak their password hashes back to the frontend.
            UserDto userDto = new UserDto(
                    updatedUser.getId(), 
                    updatedUser.getName(), 
                    updatedUser.getEmail(), 
                    updatedUser.getRole()
            );
            
            return ResponseEntity.ok(userDto);
            
        } catch (IllegalArgumentException ex) {
            // Caught if the userId does not exist in the database
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            // Blanket capture for internal faults safely avoiding HTML error traces
            return ResponseEntity.internalServerError().build();
        }
    }
}
