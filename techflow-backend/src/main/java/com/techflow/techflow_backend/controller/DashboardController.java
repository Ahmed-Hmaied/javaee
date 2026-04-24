package com.techflow.techflow_backend.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.techflow.techflow_backend.entity.Order;
import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.entity.User;
import com.techflow.techflow_backend.exception.ResourceNotFoundException;
import com.techflow.techflow_backend.repository.OrderRepository;
import com.techflow.techflow_backend.repository.ProductRepository;
import com.techflow.techflow_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping("/admin")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> adminDashboard() {
        Map<String, Object> stats = new HashMap<>();

        List<Order> allOrders = orderRepository.findAll();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED)
                .map(Order::getTotalTTC)
                .filter(t -> t != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> recentOrders = allOrders.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.getId());
                    orderMap.put("orderNumber", order.getOrderNumber());
                    orderMap.put("status", order.getStatus().name());
                    orderMap.put("totalTTC", order.getTotalTTC());
                    orderMap.put("createdAt", order.getCreatedAt());
                    orderMap.put("customerEmail", order.getCustomer() != null ? order.getCustomer().getEmail() : null);
                    return orderMap;
                })
                .collect(Collectors.toList());

        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", allOrders.size());
        stats.put("totalProducts", productRepository.countByActiveTrue());
        stats.put("totalUsers", userRepository.count());
        stats.put("recentOrders", recentOrders);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/seller")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> sellerDashboard(@RequestParam String email) {
        System.out.println("=== SELLER DASHBOARD ===");
        System.out.println("Email: " + email);
        
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));
        System.out.println("Seller ID: " + seller.getId());

        // Fetch products
        List<Product> sellerProducts = productRepository.findBySellerId(seller.getId());
        System.out.println("Products count: " + sellerProducts.size());

        // Fetch orders
        List<Order> sellerOrders = orderRepository.findOrdersBySellerId(seller.getId());
        System.out.println("Orders count: " + sellerOrders.size());

        // Calculate revenue
        BigDecimal revenue = sellerOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .map(Order::getTotalTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        System.out.println("Revenue: " + revenue);

        // Pending orders
        long pendingOrders = sellerOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.PENDING || o.getStatus() == Order.OrderStatus.PAID)
                .count();
        System.out.println("Pending orders: " + pendingOrders);

        // Low stock
        long lowStockAlerts = sellerProducts.stream()
                .filter(p -> p.getStock() < 5)
                .count();
        System.out.println("Low stock: " + lowStockAlerts);

        // Recent orders
        List<Map<String, Object>> recentOrders = sellerOrders.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.getId());
                    orderMap.put("orderNumber", order.getOrderNumber());
                    orderMap.put("status", order.getStatus().name());
                    orderMap.put("totalTTC", order.getTotalTTC());
                    orderMap.put("createdAt", order.getCreatedAt());
                    return orderMap;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("revenue", revenue);
        stats.put("pendingOrders", pendingOrders);
        stats.put("lowStockAlerts", lowStockAlerts);
        stats.put("totalProducts", sellerProducts.size());
        stats.put("recentOrders", recentOrders);

        return ResponseEntity.ok(stats);
    }
}