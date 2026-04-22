package com.smartcampus.service;

import com.smartcampus.dto.UpdateProfileRequestDto;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.smartcampus.exception.ResourceNotFoundException("User not found with ID: " + userId));
        
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateCurrentUserProfile(UpdateProfileRequestDto request) {
        User user = getCurrentlyAuthenticatedUser();

        user.setName(request.getName().trim());

        String phoneNumber = request.getPhoneNumber();
        user.setPhoneNumber(phoneNumber == null || phoneNumber.isBlank() ? null : phoneNumber.trim());

        return userRepository.save(user);
    }

    private User getCurrentlyAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new com.smartcampus.exception.ForbiddenException("No authenticated user available for this request.");
        }

        Object principal = authentication.getPrincipal();
        String userEmail;

        if (principal instanceof UserDetails) {
            userEmail = ((UserDetails) principal).getUsername();
        } else {
            userEmail = principal.toString();
        }

        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new com.smartcampus.exception.ResourceNotFoundException("Authenticated user not found."));
    }
}
