package com.smartcampus.service;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Look up a user by ID and permanently update their RBAC Role.
     */
    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        user.setRole(newRole);
        return userRepository.save(user);
    }
}
