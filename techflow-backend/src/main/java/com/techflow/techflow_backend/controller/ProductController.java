package com.techflow.techflow_backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.techflow.techflow_backend.dto.request.ProductRequest;
import com.techflow.techflow_backend.dto.response.ProductResponse;
import com.techflow.techflow_backend.entity.Category;
import com.techflow.techflow_backend.entity.Product;
import com.techflow.techflow_backend.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(Pageable pageable) {
        Page<ProductResponse> products = productService.getAllProducts(pageable)
                .map(this::toResponse);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(productService.getProductById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> search(
            @RequestParam String q, Pageable pageable) {
        return ResponseEntity.ok(
                productService.searchProducts(q, pageable).map(this::toResponse)
        );
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<ProductResponse>> topSelling() {
        List<ProductResponse> products = productService.getTopSelling()
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request,
            @RequestParam String sellerEmail) {

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .promoPrice(request.getPromoPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .build();

        Product saved = productService.createProduct(
                product, sellerEmail, request.getCategoryIds(), request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

        @PutMapping("/{id}")
        public ResponseEntity<ProductResponse> updateProduct(
                @PathVariable Long id,
                @Valid @RequestBody ProductRequest request) {

        Product updated = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .promoPrice(request.getPromoPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .build();

        Product saved = productService.updateProduct(id, updated, request);
        return ResponseEntity.ok(toResponse(saved));
        }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

        private ProductResponse toResponse(Product product) {
        List<Category> categories = product.getCategories(); // ✅ define variable
        
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .promoPrice(product.getPromoPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .imageUrls(product.getImageList())
                .active(product.isActive())
                .sellerEmail(product.getSeller() != null ? product.getSeller().getEmail() : null)
                .categories(categories != null ? categories.stream().map(Category::getName).collect(Collectors.toList()) : null)
                .categoryIds(categories != null ? categories.stream().map(Category::getId).collect(Collectors.toList()) : null) // ✅ now works
                .createdAt(product.getCreatedAt())
                .build();
        }
}