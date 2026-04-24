package com.techflow.techflow_backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.techflow.techflow_backend.dto.request.ProductRequest;
import com.techflow.techflow_backend.entity.Category;
import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.entity.User;
import com.techflow.techflow_backend.exception.ResourceNotFoundException;
import com.techflow.techflow_backend.repository.CategoryRepository;
import com.techflow.techflow_backend.repository.ProductRepository;
import com.techflow.techflow_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findByIdWithCategories(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(query, pageable);
    }

    public List<Product> getTopSelling() {
        return productRepository.findTop10ByActiveTrueOrderByCreatedAtDesc();
    }

    public Page<Product> getProductsBySeller(String sellerEmail, Pageable pageable) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + sellerEmail));
        return productRepository.findBySellerId(seller.getId(), pageable);
    }

    @Transactional
    public Product createProduct(Product product, String sellerEmail, List<Long> categoryIds, ProductRequest request) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<Category> categories = categoryRepository.findAllById(categoryIds);

        product.setSeller(seller);
        product.setCategories(categories);
        product.setActive(true);

        // 处理多图
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            product.setImageList(request.getImageUrls());
            System.out.println("✅ Creating product - imageUrls saved: " + request.getImageUrls());
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updated, ProductRequest request) {
        Product product = getProductById(id);
        
        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setPrice(updated.getPrice());
        product.setPromoPrice(updated.getPromoPrice());
        product.setStock(updated.getStock());
        product.setImageUrl(updated.getImageUrl());

        // ✅ Update categories
        if (request.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
            product.setCategories(categories);
        }

        // Handle images
        if (request.getImageUrls() != null) {
            product.setImageList(request.getImageUrls());
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }
}