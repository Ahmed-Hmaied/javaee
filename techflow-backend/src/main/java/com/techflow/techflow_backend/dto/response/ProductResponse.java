package com.techflow.techflow_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal promoPrice;
    private Integer stock;
    private String imageUrl;
    private List<String> imageUrls;   // ✅
    private boolean active;
    private String sellerEmail;
    private List<String> categories;
    private List<Long> categoryIds;
    private LocalDateTime createdAt;
}