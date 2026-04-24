package com.techflow.techflow_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.techflow.techflow_backend.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    // For list endpoints: eager fetch categories to avoid lazy loading issues
    @EntityGraph(attributePaths = {"categories"})
    Page<Product> findByActiveTrue(Pageable pageable);
    
    @EntityGraph(attributePaths = {"categories"})
    Page<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name, Pageable pageable);
    
    List<Product> findTop10ByActiveTrueOrderByCreatedAtDesc();
    long countByActiveTrue();

    // Seller-related methods
    List<Product> findBySellerId(Long sellerId);
    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    // ✅ NEW: Fetch a single product with categories eagerly
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.categories WHERE p.id = :id")
    Optional<Product> findByIdWithCategories(@Param("id") Long id);
}