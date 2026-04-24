package com.techflow.techflow_backend.dto.request;

import lombok.Data;

@Data
public class AddressRequestDto {
    private String street;
    private String city;
    private String postalCode;
    private String country;
    private boolean isPrimary;
}