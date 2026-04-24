package com.techflow.techflow_backend.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.techflow.techflow_backend.dto.request.ReviewRequest;
import com.techflow.techflow_backend.dto.response.ReviewResponse;
import com.techflow.techflow_backend.entity.Order;
import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.entity.Review;
import com.techflow.techflow_backend.entity.User;
import com.techflow.techflow_backend.exception.ResourceNotFoundException;
import com.techflow.techflow_backend.repository.OrderRepository;
import com.techflow.techflow_backend.repository.ProductRepository;
import com.techflow.techflow_backend.repository.ReviewRepository;
import com.techflow.techflow_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    // 管理员获取评价列表（返回 DTO）
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @RequestParam(defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviews;
        if ("ALL".equalsIgnoreCase(status)) {
            reviews = reviewRepository.findAll(pageable);
        } else {
            Review.ApprovalStatus approvalStatus = Review.ApprovalStatus.valueOf(status.toUpperCase());
            reviews = reviewRepository.findByApprovalStatus(approvalStatus, pageable);
        }
        Page<ReviewResponse> responsePage = reviews.map(ReviewResponse::fromEntity);
        return ResponseEntity.ok(responsePage);
    }

    // 批准评价（并更新产品平均评分）
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public ResponseEntity<ReviewResponse> approveReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setApprovalStatus(Review.ApprovalStatus.APPROVED);
        Review saved = reviewRepository.save(review);
        // 更新产品的平均评分
        updateProductAverageRating(saved.getProduct());
        return ResponseEntity.ok(ReviewResponse.fromEntity(saved));
    }

    // 拒绝评价
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public ResponseEntity<ReviewResponse> rejectReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setApprovalStatus(Review.ApprovalStatus.REJECTED);
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(ReviewResponse.fromEntity(saved));
    }

    // 删除评价（并更新产品平均评分）
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductAverageRating(product);
        return ResponseEntity.ok().build();
    }

    // 获取指定产品的已批准评价（公开访问）
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getApprovedReviewsByProduct(@PathVariable Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        List<Review> reviews = reviewRepository.findByProductAndApprovalStatus(product, Review.ApprovalStatus.APPROVED);
        List<ReviewResponse> response = reviews.stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // 提交新评价
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<ReviewResponse> createReview(@RequestBody ReviewRequest request,
                                                       @RequestParam String email) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean hasPurchased = orderRepository.existsByCustomerAndProductAndStatus(
                customer, product, Order.OrderStatus.DELIVERED);
        if (!hasPurchased) {
            throw new IllegalStateException("You can only review products you have purchased and received.");
        }

        boolean alreadyReviewed = reviewRepository.existsByCustomerAndProduct(customer, product);
        if (alreadyReviewed) {
            throw new IllegalStateException("You have already reviewed this product.");
        }

        Review review = Review.builder()
                .customer(customer)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .approvalStatus(Review.ApprovalStatus.PENDING)
                .build();

        Review saved = reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(ReviewResponse.fromEntity(saved));
    }

    // 检查当前用户是否已评价该产品
    @GetMapping("/check/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> checkUserReviewed(
            @PathVariable Long productId,
            @RequestParam String email) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        boolean reviewed = reviewRepository.existsByCustomerAndProduct(customer, product);
        Map<String, Boolean> response = new HashMap<>();
        response.put("reviewed", reviewed);
        return ResponseEntity.ok(response);
    }

    // 更新产品的平均评分（基于已批准评价）
    private void updateProductAverageRating(Product product) {
        List<Review> approvedReviews = reviewRepository.findByProductAndApprovalStatus(
                product, Review.ApprovalStatus.APPROVED);
        if (approvedReviews.isEmpty()) {
            product.setAverageRating(null);
        } else {
            double avg = approvedReviews.stream().mapToInt(Review::getRating).average().orElse(0);
            product.setAverageRating(BigDecimal.valueOf(avg));
        }
        productRepository.save(product);
    }
}