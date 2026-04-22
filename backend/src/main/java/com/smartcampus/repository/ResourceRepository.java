package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Additional query methods will be added in later steps (e.g. findByType, findByStatus)
@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

}
