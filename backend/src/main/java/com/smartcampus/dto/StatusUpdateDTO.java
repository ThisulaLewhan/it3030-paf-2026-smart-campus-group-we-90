package com.smartcampus.dto;

import com.smartcampus.entity.IncidentTicket.Status;

public class StatusUpdateDTO {

    private Status status;
    private String resolutionNotes;

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
