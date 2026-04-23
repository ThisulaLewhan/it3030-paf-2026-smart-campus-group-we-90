package com.smartcampus.dto;

import com.smartcampus.entity.IncidentTicket.Category;
import com.smartcampus.entity.IncidentTicket.Priority;
import com.smartcampus.entity.IncidentTicket.Status;

public class TicketFilterDTO {

    private Status status;
    private Priority priority;
    private Category category;
    private String assignedTechnician;
    private String createdBy;

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
