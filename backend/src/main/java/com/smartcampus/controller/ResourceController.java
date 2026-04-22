package com.smartcampus.controller;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.dto.ResourceResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody ResourceRequest request) {
        Resource created = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Additional endpoints (GET by id, PUT, DELETE) will be added in later steps
}
