package com.techflow.techflow_backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.entity.Review;
import com.techflow.techflow_backend.entity.User;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByApprovalStatus(Review.ApprovalStatus status, Pageable pageable);
    
    List<Review> findByProductAndApprovalStatus(Product product, Review.ApprovalStatus status);
    
    boolean existsByCustomerAndProduct(User customer, Product product);
}