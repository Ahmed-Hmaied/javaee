package com.techflow.techflow_backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.techflow.techflow_backend.entity.Cart;
import com.techflow.techflow_backend.entity.CartItem;
import com.techflow.techflow_backend.entity.Coupon;
import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.entity.User;
import com.techflow.techflow_backend.repository.CartRepository;
import com.techflow.techflow_backend.repository.CouponRepository;
import com.techflow.techflow_backend.repository.ProductRepository;
import com.techflow.techflow_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public Cart getCartByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return cartRepository.findByCustomerId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .customer(user)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public Cart addItem(String email, Long productId, Integer quantity) {
        Cart cart = getCartByEmail(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Not enough stock available");
        }

        BigDecimal unitPrice = product.getPromoPrice() != null ? product.getPromoPrice() : product.getPrice();

        cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .ifPresentOrElse(
                        item -> item.setQuantity(item.getQuantity() + quantity),
                        () -> cart.getItems().add(
                                CartItem.builder()
                                        .cart(cart)
                                        .product(product)
                                        .quantity(quantity)
                                        .unitPrice(unitPrice)
                                        .build()
                        )
                );

        // Re-validate coupon after cart changes – if invalid, remove it silently
        revalidateCoupon(cart);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItem(String email, Long itemId, Integer quantity) {
        Cart cart = getCartByEmail(email);
        cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        
        revalidateCoupon(cart);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(String email, Long itemId) {
        Cart cart = getCartByEmail(email);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        
        revalidateCoupon(cart);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart applyCoupon(String email, String code) {
        Cart cart = getCartByEmail(email);
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Invalid or expired coupon"));
        validateCoupon(coupon, cart);
        cart.setAppliedCoupon(coupon);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeCoupon(String email) {
        Cart cart = getCartByEmail(email);
        cart.setAppliedCoupon(null);
        return cartRepository.save(cart);
    }

    // ✅ New helper: revalidate coupon after cart changes; if invalid, remove it
    private void revalidateCoupon(Cart cart) {
        if (cart.getAppliedCoupon() == null) return;
        try {
            validateCoupon(cart.getAppliedCoupon(), cart);
        } catch (RuntimeException e) {
            // Coupon is no longer valid – silently remove it
            cart.setAppliedCoupon(null);
        }
    }

    private void validateCoupon(Coupon coupon, Cart cart) {
        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Coupon expired");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new RuntimeException("Coupon usage limit reached");
        }
        if (cart.getSubtotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Cart is empty");
        }
    }
}