package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.repository.ResourceRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public Resource createResource(ResourceRequest request) {
        Resource resource = new Resource(
                request.getName(),
                request.getType(),
                request.getCapacity(),
                request.getLocation(),
                request.getAvailabilityStart(),
                request.getAvailabilityEnd(),
                request.getStatus()
        );
        return resourceRepository.save(resource);
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(ResourceResponse::from)
                .collect(Collectors.toList());
    }

    // Additional service methods (getById, update, delete) will be added in later steps
}
