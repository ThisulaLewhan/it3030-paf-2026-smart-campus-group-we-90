package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceType;
import com.smartcampus.exception.ResourceNotFoundException;
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

    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        return ResourceResponse.from(resource);
    }

    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailabilityStart(request.getAvailabilityStart());
        resource.setAvailabilityEnd(request.getAvailabilityEnd());
        resource.setStatus(request.getStatus());

        Resource updatedResource = resourceRepository.save(resource);
        return ResourceResponse.from(updatedResource);
    }

    public void deleteResource(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        resourceRepository.delete(resource);
    }

    public List<ResourceResponse> searchResources(ResourceType type, Integer capacity, String location) {
        String normalizedLocation = location == null ? null : location.trim().toLowerCase();

        return resourceRepository.findAll()
                .stream()
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> capacity == null || (resource.getCapacity() != null && resource.getCapacity() >= capacity))
                .filter(resource -> normalizedLocation == null || normalizedLocation.isBlank()
                        || (resource.getLocation() != null && resource.getLocation().toLowerCase().contains(normalizedLocation)))
                .map(ResourceResponse::from)
                .collect(Collectors.toList());
    }
}
