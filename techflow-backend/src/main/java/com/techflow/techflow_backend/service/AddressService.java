package com.techflow.techflow_backend.service;

import com.techflow.techflow_backend.dto.request.AddressRequestDto;
import com.techflow.techflow_backend.dto.response.AddressResponseDto;
import com.techflow.techflow_backend.entity.Address;
import com.techflow.techflow_backend.entity.User;
import com.techflow.techflow_backend.exception.ResourceNotFoundException;
import com.techflow.techflow_backend.repository.AddressRepository;
import com.techflow.techflow_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public AddressResponseDto createAddress(String email, AddressRequestDto requestDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If setting as primary, unset any existing primary addresses
        if (requestDto.isPrimary()) {
            addressRepository.findByUser(user).forEach(addr -> {
                addr.setPrimary(false);
                addressRepository.save(addr);
            });
        }

        Address address = Address.builder()
                .user(user)
                .street(requestDto.getStreet())
                .city(requestDto.getCity())
                .postalCode(requestDto.getPostalCode())
                .country(requestDto.getCountry())
                .isPrimary(requestDto.isPrimary())
                .build();

        Address saved = addressRepository.save(address);
        return AddressResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AddressResponseDto> getAddressesByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return addressRepository.findByUser(user).stream()
                .map(AddressResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}