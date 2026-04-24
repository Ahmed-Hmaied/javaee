package com.techflow.techflow_backend.dto.request;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {
    @NotNull
    private String name;
    private String description;
    @NotNull
    private BigDecimal price;
    private BigDecimal promoPrice;
    @NotNull
    private Integer stock;
    private String imageUrl;
    @JsonProperty("imageUrls")
    private List<String> imageUrls;   // ✅
    private List<Long> categoryIds;
}