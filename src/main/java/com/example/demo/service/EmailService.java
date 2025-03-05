package com.example.demo.service;

import com.example.demo.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendOrderConfirmation(Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(order.getCustomerEmail());
        message.setSubject("Xác nhận đơn hàng #" + order.getId());
        message.setText("Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: " + order.getId());
        mailSender.send(message);
    }

    public void sendOrderStatusUpdate(Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(order.getCustomerEmail());
        message.setSubject("Cập nhật trạng thái đơn hàng #" + order.getId());
        message.setText("Đơn hàng của bạn đã được cập nhật sang trạng thái: " + order.getStatus());
        mailSender.send(message);
    }
}