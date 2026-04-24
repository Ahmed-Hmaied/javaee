package com.techflow.techflow_backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponseDto {
    private Long id;
    private String orderNumber;
    private com.techflow.techflow_backend.entity.Order.OrderStatus status;
    private BigDecimal subTotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;      // ✅ 新增
    private BigDecimal totalTTC;
    private LocalDateTime createdAt;
    private AddressResponseDto deliveryAddress;
    private List<OrderItemDto> items;
    private CouponDto appliedCoupon;        // ✅ 新增

    @Data
    @Builder
    public static class CouponDto {
        private Long id;
        private String code;
        private String type;
        private BigDecimal value;
    }
}