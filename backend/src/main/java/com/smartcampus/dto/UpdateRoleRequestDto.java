package com.smartcampus.dto;

import com.smartcampus.entity.Role;

public class UpdateRoleRequestDto {

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
