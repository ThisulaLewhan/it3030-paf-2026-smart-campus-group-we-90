package com.smartcampus.dto;

import com.smartcampus.entity.Role;
import jakarta.validation.constraints.NotNull;

public class UpdateRoleRequestDto {

    @NotNull(message = "Role must be explicitly provided (e.g., USER or ADMIN)")
    private Role role;

    public UpdateRoleRequestDto() {
    }

    public UpdateRoleRequestDto(Role role) {
        this.role = role;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
