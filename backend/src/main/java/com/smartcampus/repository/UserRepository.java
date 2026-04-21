package com.smartcampus.repository;

import com.smartcampus.entity.User;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

// Handles all database queries for the User collection
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Find a user by email – used during login and JWT validation
    Optional<User> findByEmail(String email);

    // Check if an email is already registered before sign-up
    boolean existsByEmail(String email);
}
