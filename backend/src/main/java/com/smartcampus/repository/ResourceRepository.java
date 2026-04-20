package com.smartcampus.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartcampus.entity.Resource;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {}
