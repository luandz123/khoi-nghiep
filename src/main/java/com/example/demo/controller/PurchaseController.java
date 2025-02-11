package com.example.demo.controller;

import com.example.demo.dto.PurchaseRequest;
import com.example.demo.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> purchaseCourse(@RequestBody PurchaseRequest request) {
        purchaseService.purchaseCourse(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Mua khóa học thành công!");
        return ResponseEntity.ok(response);
    }
}