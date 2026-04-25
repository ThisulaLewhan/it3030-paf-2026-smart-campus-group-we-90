package com.smartcampus.service;

import com.smartcampus.entity.Attachment;
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
     *
     * @throws NoSuchElementException   if the ticket does not exist
     * @throws IllegalArgumentException if count/type/size validation fails
     * @throws IOException              on file storage errors
     */
    public List<Attachment> uploadAttachmentsForTicket(String ticketId, List<MultipartFile> files)
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

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
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
            saved.add(attachmentRepository.save(attachment));
        }
        return saved;
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
