package com.example.demo.controller;

import com.example.demo.dto.CancelRegistrationRequest;
import com.example.demo.dto.CancelRegistrationResponse;
import com.example.demo.dto.RegistrationRequest;
import com.example.demo.dto.RegistrationResponse;
import com.example.demo.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> registerCourse(@RequestBody RegistrationRequest request) {
        RegistrationResponse response = registrationService.registerCourse(request);
        if ("Success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/cancel")
    public ResponseEntity<CancelRegistrationResponse> cancelRegistration(@RequestBody CancelRegistrationRequest request) {
        CancelRegistrationResponse response = registrationService.cancelRegistration(request);
        if ("Success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}