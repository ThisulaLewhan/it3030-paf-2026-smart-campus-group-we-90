package com.smartcampus.exception;

import com.smartcampus.dto.ErrorResponseDto;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Triggers when our code manually throws ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFound(ResourceNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    // Triggers for specific logic-level ownership blocks
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponseDto> handleForbidden(ForbiddenException ex) {
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage());
    }

    // Handles faulty input formats natively
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleBadRequest(IllegalArgumentException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage());
    }

    // Native Spring Security hook for busted Logins/JWTs (Maps to 401)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDto> handleUnauthorized(AuthenticationException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, "Unauthorized", "Authentication failed: Invalid credentials or expired token.");
    }

    // Native Spring Security hook for blocked @PreAuthorize endpoints (Maps to 403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleAccessDenied(AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", "You do not have the designated roles required to access this subsystem.");
    }

    // Triggers when @Valid constraints natively fail inside RequestBody payloads
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        // Collects all individual field errors into one comma-separated clean string
        String validationErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((msg1, msg2) -> msg1 + ", " + msg2)
                .orElse("Validation failed with unspecified malformed constraints");
                
        return buildError(HttpStatus.BAD_REQUEST, "Validation Failure", validationErrors);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponseDto> handleDataAccessException(DataAccessException ex) {
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Database Error",
                "Profile data could not be saved because the database schema is out of date. Restart the backend and try again."
        );
    }

    // Final safety net intercepting unhandled crashes protecting server architecture
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneric(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected critical fault occurred.");
    }

    // Format builder
    private ResponseEntity<ErrorResponseDto> buildError(HttpStatus status, String error, String message) {
        ErrorResponseDto response = new ErrorResponseDto(status.value(), error, message);
        return new ResponseEntity<>(response, status);
    }
}
