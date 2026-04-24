package com.smartcampus.dto;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceStatus;
import com.smartcampus.entity.ResourceType;

import java.time.LocalTime;

public class ResourceResponse {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private ResourceStatus status;

    // ── Static factory ────────────────────────────────────────────────────────

    public static ResourceResponse from(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.id = resource.getId();
        response.name = resource.getName();
        response.type = resource.getType();
        response.capacity = resource.getCapacity();
        response.location = resource.getLocation();
        response.availabilityStart = resource.getAvailabilityStart();
        response.availabilityEnd = resource.getAvailabilityEnd();
        response.status = resource.getStatus();
        return response;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public ResourceType getType() {
        return type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getLocation() {
        return location;
    }

    public LocalTime getAvailabilityStart() {
        return availabilityStart;
    }

    public LocalTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public ResourceStatus getStatus() {
        return status;
    }
}
