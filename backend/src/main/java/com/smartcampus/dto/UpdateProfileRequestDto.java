package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequestDto {

    @NotBlank(message = "Display name is required")
    @Size(min = 2, max = 100, message = "Display name must be between 2 and 100 characters")
    private String name;

    @Size(max = 30, message = "Phone number must be 30 characters or less")
    @Pattern(
            regexp = "^$|^[+]?[0-9()\\-\\s]{7,30}$",
            message = "Phone number must contain only digits, spaces, parentheses, hyphens, or a leading +"
    )
    private String phoneNumber;

    public UpdateProfileRequestDto() {
    }

    public UpdateProfileRequestDto(String name, String phoneNumber) {
        this.name = name;
        this.phoneNumber = phoneNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
