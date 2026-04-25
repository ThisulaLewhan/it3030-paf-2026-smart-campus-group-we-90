package com.smartcampus.service;

import com.smartcampus.entity.Attachment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.AttachmentRepository;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.TicketRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AttachmentService {

    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;
    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");

    private final AttachmentRepository attachmentRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final TicketRepository ticketRepository;

    @Value("${app.upload.dir:uploads/attachments}")
    private String uploadDir;

    public AttachmentService(AttachmentRepository attachmentRepository,
                              IncidentTicketRepository incidentTicketRepository,
                              TicketRepository ticketRepository) {
        this.attachmentRepository = attachmentRepository;
        this.incidentTicketRepository = incidentTicketRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<Attachment> uploadAttachments(String ticketId, List<MultipartFile> files)
            throws IOException {

        // Verify ticket exists
        incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Incident ticket not found: " + ticketId));

        // Check combined existing + incoming count
        long existing = attachmentRepository.countByTicketId(ticketId);
        if (existing + files.size() > MAX_ATTACHMENTS_PER_TICKET) {
            throw new IllegalArgumentException(
                    "A ticket may have at most " + MAX_ATTACHMENTS_PER_TICKET
                    + " attachments. Currently has " + existing + ".");
        }

        // Validate each file before persisting any
        for (MultipartFile file : files) {
            validateFile(file);
        }

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        List<Attachment> saved = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = getExtension(originalName);
            // Use a UUID-based name to prevent path traversal / filename collisions
            String storedName = UUID.randomUUID().toString() + "." + extension;
            Path targetPath = uploadPath.resolve(storedName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setTicketId(ticketId);
            attachment.setFilename(originalName);
            attachment.setStoredPath(targetPath.toString());
            attachment.setContentType(file.getContentType());
            attachment.setSizeBytes(file.getSize());
            attachment.setUploadedAt(LocalDateTime.now());

            saved.add(attachmentRepository.save(attachment));
        }

        return saved;
    }

    public List<Attachment> getAttachmentsByTicket(String ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

    /**
     * Uploads image attachments for a regular ticket (/api/tickets).
     * Validates: max 3 total per ticket, jpg/jpeg/png only, max 5 MB each.
     * Files are stored under {uploadDir}/tickets/{ticketId}/.
     *
     * @throws NoSuchElementException   if the ticket does not exist
     * @throws IllegalArgumentException if count/type/size validation fails
     * @throws IOException              on file storage errors
     */
    public List<Attachment> uploadAttachmentsForTicket(String ticketId, List<MultipartFile> files,
                                                        String uploadedBy)
            throws IOException {

        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketId));

        long existing = attachmentRepository.countByTicketId(ticketId);
        if (existing + files.size() > MAX_ATTACHMENTS_PER_TICKET) {
            throw new IllegalArgumentException(
                    "A ticket may have at most " + MAX_ATTACHMENTS_PER_TICKET
                    + " attachments. Currently has " + existing + ".");
        }

        for (MultipartFile file : files) {
            validateFile(file);
        }

        // Store under a per-ticket subdirectory to keep uploads organised
        Path uploadPath = Paths.get(uploadDir, "tickets", ticketId).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        List<Attachment> saved = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = getExtension(originalName);
            String storedName = UUID.randomUUID().toString() + "." + extension;
            Path targetPath = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setTicketId(ticketId);
            attachment.setFilename(originalName);
            attachment.setStoredPath(targetPath.toString());
            attachment.setContentType(file.getContentType());
            attachment.setSizeBytes(file.getSize());
            attachment.setUploadedAt(LocalDateTime.now());
            attachment.setUploadedBy(uploadedBy);
            saved.add(attachmentRepository.save(attachment));
        }
        return saved;
    }

    /**
     * Returns attachments for a ticket, enforcing role-based access:
     * ADMIN → any ticket; TECHNICIAN → assigned tickets only; USER → own tickets only.
     */
    public List<Attachment> getAttachmentsForTicket(String ticketId, String callerEmail,
                                                     String callerRole) {
        checkTicketAccess(ticketId, callerEmail, callerRole);
        return attachmentRepository.findByTicketId(ticketId);
    }

    /**
     * Validates access and returns the raw bytes of a single attachment together with
     * its MIME type so the controller can set the correct Content-Type header.
     */
    public AttachmentDownloadResult getAttachmentBytes(String ticketId, String attachmentId,
                                                        String callerEmail, String callerRole)
            throws IOException {
        checkTicketAccess(ticketId, callerEmail, callerRole);

        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));

        if (!ticketId.equals(attachment.getTicketId())) {
            throw new ResourceNotFoundException("Attachment " + attachmentId
                    + " does not belong to ticket " + ticketId);
        }

        Path filePath = Paths.get(attachment.getStoredPath());
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Attachment file not found on disk: " + attachmentId);
        }

        byte[] bytes = Files.readAllBytes(filePath);
        return new AttachmentDownloadResult(attachment.getContentType(), attachment.getFilename(), bytes);
    }

    // ── Inner result type ─────────────────────────────────────────────────────

    public static class AttachmentDownloadResult {
        private final String contentType;
        private final String filename;
        private final byte[] bytes;

        public AttachmentDownloadResult(String contentType, String filename, byte[] bytes) {
            this.contentType = contentType;
            this.filename = filename;
            this.bytes = bytes;
        }

        public String getContentType() { return contentType; }
        public String getFilename()    { return filename; }
        public byte[] getBytes()       { return bytes; }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Checks that callerEmail is permitted to access attachments for the given ticket.
     * Throws ResourceNotFoundException (404) if the ticket doesn't exist,
     * ForbiddenException (403) if the caller lacks access.
     */
    private void checkTicketAccess(String ticketId, String callerEmail, String callerRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        if ("ROLE_ADMIN".equals(callerRole)) {
            return; // admins can access all tickets
        }

        if ("ROLE_TECHNICIAN".equals(callerRole)) {
            String assigned = ticket.getAssignedTechnician();
            if (assigned == null || !assigned.equals(callerEmail)) {
                throw new ForbiddenException("You are not assigned to this ticket.");
            }
            return;
        }

        // ROLE_USER — must be the ticket creator
        if (!callerEmail.equals(ticket.getCreatedBy())) {
            throw new ForbiddenException("You are not the owner of this ticket.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(
                    "File '" + file.getOriginalFilename() + "' exceeds maximum allowed size of 5 MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "File '" + file.getOriginalFilename()
                    + "' has unsupported type '" + contentType
                    + "'. Only jpg, jpeg, and png images are allowed.");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getExtension(originalName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "File extension '." + extension + "' is not allowed. Only jpg, jpeg, and png are accepted.");
        }

        // Guard against path traversal in filename
        if (originalName.contains("..") || originalName.contains("/") || originalName.contains("\\")) {
            throw new IllegalArgumentException("Invalid filename: " + originalName);
        }
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            return "";
        }
        return filename.substring(dot + 1);
    }
}
