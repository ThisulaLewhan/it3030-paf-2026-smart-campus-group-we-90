package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// TODO: Add custom query methods in the next step
@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

}
