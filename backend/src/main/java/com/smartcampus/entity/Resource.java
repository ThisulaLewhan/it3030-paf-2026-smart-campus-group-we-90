package com.smartcampus.entity;

import java.time.LocalTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    private ResourceType type;

    private Integer capacity;

    private String location;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    private ResourceStatus status;

    // ── Constructors ─────────────────────────────────────────────────────────

    public Resource() {
    }

    public Resource(String name, ResourceType type, Integer capacity, String location,
                    LocalTime availabilityStart, LocalTime availabilityEnd, ResourceStatus status) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availabilityStart = availabilityStart;
        this.availabilityEnd = availabilityEnd;
        this.status = status;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

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

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalTime getAvailabilityStart() {
        return availabilityStart;
    }

    public void setAvailabilityStart(LocalTime availabilityStart) {
        this.availabilityStart = availabilityStart;
    }

    public LocalTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public void setAvailabilityEnd(LocalTime availabilityEnd) {
        this.availabilityEnd = availabilityEnd;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}
