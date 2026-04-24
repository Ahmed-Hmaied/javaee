package com.techflow.techflow_backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType type;

    @Column(name = "coupon_value", nullable = false)
    private BigDecimal value;

    @Column(name = "max_usages")
    private Integer maxUses;

    @Column(name = "current_usages")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "expires_at")
    private LocalDate expirationDate;

    @Builder.Default
    private boolean active = true;

    public enum DiscountType {
        PERCENT, FIXED
    }
}