package com.techflow.techflow_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.techflow.techflow_backend.dto.request.AddressRequestDto;
import com.techflow.techflow_backend.dto.response.AddressResponseDto;
import com.techflow.techflow_backend.service.AddressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<AddressResponseDto> createAddress(
            @RequestParam String email,
            @RequestBody AddressRequestDto addressDto) {
        AddressResponseDto created = addressService.createAddress(email, addressDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<AddressResponseDto>> getAddresses(@RequestParam String email) {
        List<AddressResponseDto> addresses = addressService.getAddressesByEmail(email);
        return ResponseEntity.ok(addresses);
    }
}