package com.techflow.techflow_backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.techflow.techflow_backend.dto.request.ProductRequest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal promoPrice;
    private Integer stock;
    private String imageUrl;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    @ManyToMany
    @JoinTable(
            name = "product_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ✅ 辅助方法：将逗号分隔字符串转换为列表
    @Transient
    public List<String> getImageList() {
        if (imageUrls == null || imageUrls.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(imageUrls.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    // ✅ 辅助方法：将列表转换为逗号分隔字符串
    @Transient
    public void setImageList(List<String> urls) {
        this.imageUrls = urls != null && !urls.isEmpty() ? String.join(",", urls) : null;
    }
    public void setImageUrlsFromRequest(ProductRequest request) {
    if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
        this.imageUrls = String.join(",", request.getImageUrls());
    } else {
        this.imageUrls = null;
    }
}
}