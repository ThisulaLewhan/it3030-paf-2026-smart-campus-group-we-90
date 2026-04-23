package com.smartcampus.controller;

import com.smartcampus.entity.Attachment;
import com.smartcampus.service.AttachmentService;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/incident-tickets")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    /**
     * POST /api/incident-tickets/{id}/attachments
     * Authenticated users upload image attachments (multipart/form-data, field name: "files").
     * Validations enforced:
     *   - Max 3 attachments per ticket (across all uploads combined)
     *   - Only jpg / jpeg / png allowed
     *   - Max 5 MB per file
     * Returns 201 Created with saved metadata, 400 for validation failures,
     *         403 if unauthenticated, 404 if ticket not found.
     */
    @PostMapping(value = "/{id}/attachments", consumes = "multipart/form-data")
    public ResponseEntity<Object> uploadAttachments(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body("No files provided.");
        }

        try {
            List<Attachment> saved = attachmentService.uploadAttachments(id, files);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File storage error: " + e.getMessage());
        }
    }

    /**
     * GET /api/incident-tickets/{id}/attachments
     * Returns all attachment metadata for a ticket.
     * Returns 200 OK, 403 if unauthenticated, 404 if ticket not found.
     */
    @GetMapping("/{id}/attachments")
    public ResponseEntity<Object> getAttachments(
            @PathVariable String id,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            List<Attachment> attachments = attachmentService.getAttachmentsByTicket(id);
            return ResponseEntity.ok(attachments);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
