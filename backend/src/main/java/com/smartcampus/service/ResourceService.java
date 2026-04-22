package com.smartcampus.service;

import com.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// TODO: Add service methods (CRUD operations) in the next step
@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

}
