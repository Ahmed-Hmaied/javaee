package com.techflow.techflow_backend.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.techflow.techflow_backend.dto.request.CartItemRequest;
import com.techflow.techflow_backend.dto.response.CartResponse;
import com.techflow.techflow_backend.entity.Cart;
import com.techflow.techflow_backend.entity.Coupon;
import com.techflow.techflow_backend.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestParam String email) {
        return ResponseEntity.ok(toResponse(cartService.getCartByEmail(email)));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @RequestParam String email,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(toResponse(cartService.addItem(email, request.getProductId(), request.getQuantity())));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @RequestParam String email,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(toResponse(cartService.updateItem(email, itemId, quantity)));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @RequestParam String email,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(toResponse(cartService.removeItem(email, itemId)));
    }

    @PostMapping("/coupon")
    public ResponseEntity<CartResponse> applyCoupon(
            @RequestParam String email,
            @RequestParam String code) {
        return ResponseEntity.ok(toResponse(cartService.applyCoupon(email, code)));
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<CartResponse> removeCoupon(@RequestParam String email) {
        return ResponseEntity.ok(toResponse(cartService.removeCoupon(email)));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items = cart.getItems() == null ? List.of() :
                cart.getItems().stream().map(item -> {
                    BigDecimal unitPrice = item.getProduct().getPromoPrice() != null ?
                            item.getProduct().getPromoPrice() : item.getProduct().getPrice();
                    return CartResponse.CartItemResponse.builder()
                            .itemId(item.getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .quantity(item.getQuantity())
                            .unitPrice(unitPrice)
                            .subtotal(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build();
                }).collect(Collectors.toList());

        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal shippingFee = cart.getShippingFee();
        BigDecimal discountAmount = cart.getDiscountAmount();
        BigDecimal totalAfterDiscount = cart.getTotalAfterDiscount();

        CartResponse.CouponDto appliedCoupon = null;
        if (cart.getAppliedCoupon() != null) {
            Coupon c = cart.getAppliedCoupon();
            appliedCoupon = CartResponse.CouponDto.builder()
                    .id(c.getId())
                    .code(c.getCode())
                    .type(c.getType().name())
                    .value(c.getValue())
                    .build();
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .totalAfterDiscount(totalAfterDiscount)
                .appliedCoupon(appliedCoupon)
                .build();
    }
}