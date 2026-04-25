package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public class TicketAssignDTO {

    @NotBlank(message = "technicianId must not be blank")
    private String technicianId;

    public String getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(String technicianId) {
        this.technicianId = technicianId;
    }
}
