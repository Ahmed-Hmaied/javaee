package com.techflow.techflow_backend.dto.response;

import java.time.LocalDateTime;

import com.techflow.techflow_backend.entity.Review;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Review.ApprovalStatus approvalStatus;
    private CustomerDto customer;
    private ProductDto product;

    @Data
    @Builder
    public static class CustomerDto {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
    }

    @Data
    @Builder
    public static class ProductDto {
        private Long id;
        private String name;
    }

    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .approvalStatus(review.getApprovalStatus())
                .customer(CustomerDto.builder()
                        .id(review.getCustomer().getId())
                        .firstName(review.getCustomer().getFirstName())
                        .lastName(review.getCustomer().getLastName())
                        .email(review.getCustomer().getEmail())
                        .build())
                .product(ProductDto.builder()
                        .id(review.getProduct().getId())
                        .name(review.getProduct().getName())
                        .build())
                .build();
    }
}