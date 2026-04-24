package com.techflow.techflow_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.techflow.techflow_backend.dto.response.AddressResponseDto;
import com.techflow.techflow_backend.dto.response.OrderItemDto;
import com.techflow.techflow_backend.dto.response.OrderResponseDto;
import com.techflow.techflow_backend.entity.Address;
import com.techflow.techflow_backend.entity.Cart;
import com.techflow.techflow_backend.entity.Coupon;
import com.techflow.techflow_backend.entity.Order;
import com.techflow.techflow_backend.entity.OrderItem;
import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.entity.User;
import com.techflow.techflow_backend.exception.ResourceNotFoundException;
import com.techflow.techflow_backend.exception.UnauthorizedException;
import com.techflow.techflow_backend.repository.AddressRepository;
import com.techflow.techflow_backend.repository.CartRepository;
import com.techflow.techflow_backend.repository.CouponRepository;
import com.techflow.techflow_backend.repository.OrderRepository;
import com.techflow.techflow_backend.repository.ProductRepository;
import com.techflow.techflow_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;   // ✅ 新增

    @Transactional
    public OrderResponseDto createOrder(String email, Long addressId) {
        // 1. Fetch user
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Fetch cart
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot place order with empty cart");
        }

        // 3. Fetch address
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(customer.getId())) {
            throw new UnauthorizedException("Address does not belong to user");
        }

        // 4. Calculate totals with coupon discount
        BigDecimal subTotal = cart.getSubtotal();
        BigDecimal shippingFee = cart.getShippingFee();
        BigDecimal discountAmount = cart.getDiscountAmount();
        BigDecimal totalTTC = cart.getTotalAfterDiscount();

        // 5. Create order
        Order order = Order.builder()
                .customer(customer)
                .orderNumber(generateOrderNumber())
                .status(Order.OrderStatus.PENDING)
                .deliveryAddress(address)
                .subTotal(subTotal)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)      // ✅ 保存折扣
                .appliedCoupon(cart.getAppliedCoupon()) // ✅ 关联优惠券
                .totalTTC(totalTTC)
                .build();

        // 6. Create order items from cart items
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(cartItem -> {
                    Product product = cartItem.getProduct();
                    if (product.getStock() < cartItem.getQuantity()) {
                        throw new IllegalStateException("Insufficient stock for product: " + product.getName());
                    }
                    product.setStock(product.getStock() - cartItem.getQuantity());
                    productRepository.save(product);

                    return OrderItem.builder()
                            .order(order)
                            .product(product)
                            .variant(cartItem.getVariant())
                            .quantity(cartItem.getQuantity())
                            .unitPrice(cartItem.getUnitPrice())
                            .build();
                })
                .collect(Collectors.toList());

        order.setItems(orderItems);

        // 7. Save order
        Order savedOrder = orderRepository.save(order);

        // 8. ✅ Increment coupon usage count
        Coupon appliedCoupon = cart.getAppliedCoupon();
        if (appliedCoupon != null) {
            appliedCoupon.setUsedCount(appliedCoupon.getUsedCount() + 1);
            couponRepository.save(appliedCoupon);
        }

        // 9. Clear cart and remove coupon reference
        cart.getItems().clear();
        cart.setAppliedCoupon(null);
        cartRepository.save(cart);

        // 10. Convert to DTO
        return mapToDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByCustomerEmail(String email) {
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Order> orders = orderRepository.findByCustomerOrderByCreatedAtDesc(customer);

        orders.forEach(order -> {
            order.getItems().size();
            order.getItems().forEach(item -> item.getProduct().getName());
        });

        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelOrder(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getEmail().equals(email)) {
            throw new UnauthorizedException("Order does not belong to user");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING &&
            order.getStatus() != Order.OrderStatus.PAID) {
            throw new IllegalStateException("Order cannot be cancelled in status: " + order.getStatus());
        }

        // Restore stock
        order.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        });

        // ✅ Decrement coupon usage count
        Coupon appliedCoupon = order.getAppliedCoupon();
        if (appliedCoupon != null) {
            appliedCoupon.setUsedCount(Math.max(0, appliedCoupon.getUsedCount() - 1));
            couponRepository.save(appliedCoupon);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public OrderResponseDto mapToDto(Order order) {
        OrderResponseDto.CouponDto couponDto = null;
        if (order.getAppliedCoupon() != null) {
            Coupon c = order.getAppliedCoupon();
            couponDto = OrderResponseDto.CouponDto.builder()
                    .id(c.getId())
                    .code(c.getCode())
                    .type(c.getType().name())
                    .value(c.getValue())
                    .build();
        }

        return OrderResponseDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subTotal(order.getSubTotal())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())      // ✅
                .totalTTC(order.getTotalTTC())
                .createdAt(order.getCreatedAt())
                .deliveryAddress(AddressResponseDto.fromEntity(order.getDeliveryAddress()))
                .items(order.getItems().stream()
                        .map(OrderItemDto::fromEntity)
                        .collect(Collectors.toList()))
                .appliedCoupon(couponDto)                       // ✅
                .build();
    }
}