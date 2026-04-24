package com.techflow.techflow_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.techflow.techflow_backend.entity.Order;
import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.entity.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);
    Optional<Order> findByOrderNumber(String orderNumber);

    // ✅ NEW: Find orders that contain products from a specific seller
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.seller.id = :sellerId")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE o.customer = :customer AND i.product = :product AND o.status = :status")
    boolean existsByCustomerAndProductAndStatus(@Param("customer") User customer, @Param("product") Product product, @Param("status") Order.OrderStatus status);
}