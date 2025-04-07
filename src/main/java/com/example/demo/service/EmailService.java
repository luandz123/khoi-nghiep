package com.example.demo.service;

import com.example.demo.entity.Order;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    public void sendOrderConfirmation(Order order) {
        // Mock implementation - in production, this would send an actual email
        System.out.println("Sending order confirmation email to: " + order.getCustomerEmail());
        System.out.println("Order ID: " + order.getId());
        System.out.println("Total: " + order.getTotalPrice());
    }
    
    public void sendOrderStatusUpdate(Order order) {
        // Mock implementation - in production, this would send an actual email
        System.out.println("Sending order status update email to: " + order.getCustomerEmail());
        System.out.println("Order ID: " + order.getId());
        System.out.println("New Status: " + order.getStatus());
    }
}