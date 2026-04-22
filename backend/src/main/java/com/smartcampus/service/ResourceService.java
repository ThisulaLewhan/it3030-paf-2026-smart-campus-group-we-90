package com.smartcampus.service;

import com.smartcampus.entity.Resource;
import com.smartcampus.repository.ResourceRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + id));
    }

    public Resource createResource(Resource resource) {
        LocalDateTime now = LocalDateTime.now();
        resource.setCreatedAt(now);
        resource.setUpdatedAt(now);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);
        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setStatus(updatedResource.getStatus());
        existingResource.setUpdatedAt(LocalDateTime.now());
        return resourceRepository.save(existingResource);
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }
}
