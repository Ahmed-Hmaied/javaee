package com.techflow.techflow_backend.dto.response;

import com.techflow.techflow_backend.entity.Address;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponseDto {
    private Long id;
    private String street;
    private String city;
    private String postalCode;
    private String country;
    private boolean isPrimary;

    public static AddressResponseDto fromEntity(Address address) {
        return AddressResponseDto.builder()
                .id(address.getId())
                .street(address.getStreet())
                .city(address.getCity())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isPrimary(address.isPrimary())
                .build();
    }
}