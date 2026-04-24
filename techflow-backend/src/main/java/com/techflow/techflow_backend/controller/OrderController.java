package com.techflow.techflow_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.techflow.techflow_backend.dto.response.OrderResponseDto;
import com.techflow.techflow_backend.entity.Order;
import com.techflow.techflow_backend.entity.User;
import com.techflow.techflow_backend.exception.ResourceNotFoundException;
import com.techflow.techflow_backend.repository.OrderRepository;
import com.techflow.techflow_backend.repository.UserRepository;
import com.techflow.techflow_backend.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<OrderResponseDto> placeOrder(
            @RequestParam String email,
            @RequestParam Long addressId) {
        OrderResponseDto order = orderService.createOrder(email, addressId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(@RequestParam String email) {
        List<OrderResponseDto> orders = orderService.getOrdersByCustomerEmail(email);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam String email) {
        orderService.cancelOrder(orderId, email);
        return ResponseEntity.ok().build();
    }

    // ✅ NEW: Get orders for seller (orders containing seller's products)
    @GetMapping("/my-selling")
    public ResponseEntity<List<OrderResponseDto>> getSellerOrders(@RequestParam String email) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));
        List<Order> orders = orderRepository.findOrdersBySellerId(seller.getId());
        List<OrderResponseDto> dtos = orders.stream()
                .map(orderService::mapToDto)   // Make mapToDto public in OrderService or create a helper
                .toList();
        return ResponseEntity.ok(dtos);
    }

    // ✅ NEW: Update order status (seller/admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status));
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(orderService.mapToDto(saved));
    }
}