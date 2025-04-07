package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    public List<OrderResponse> getAllOrders(String status, String search, String sort) {
        // Xử lý tham số sắp xếp từ frontend
        String sortField = "createdAt"; // Mặc định sắp xếp theo ngày tạo
        Sort.Direction direction = Sort.Direction.DESC; // Mặc định giảm dần

        if (sort != null && !sort.isEmpty()) {
            String[] sortParams = sort.split(",");
            if (sortParams.length > 0) {
                sortField = sortParams[0];
                if (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1])) {
                    direction = Sort.Direction.ASC;
                }
            }
        }

        Sort sortObject = Sort.by(direction, sortField);
        List<Order> orders = orderRepository.findByFiltersWithSort(status, search, sortObject);
        
        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrder(Long id) {
        Order order = findOrderById(id);
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setTotalPrice(request.getTotalPrice());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setItems(createOrderItems(order, request.getItems()));
        
        Order savedOrder = orderRepository.save(order);
        try {
            emailService.sendOrderConfirmation(savedOrder);
        } catch (Exception e) {
            // Log the error but continue
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
        return mapToOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = findOrderById(id);
        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
            order = orderRepository.save(order);
            try {
                emailService.sendOrderStatusUpdate(order);
            } catch (Exception e) {
                // Log the error but continue
                System.err.println("Failed to send status update email: " + e.getMessage());
            }
            return mapToOrderResponse(order);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ: " + status);
        }
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = findOrderById(id);
        // Restore product stock
        order.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        });
        orderRepository.delete(order);
    }

    private Order findOrderById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerEmail(order.getCustomerEmail());
        response.setTotalPrice(order.getTotalPrice());
        response.setStatus(order.getStatus().name());
        response.setCreatedAt(order.getCreatedAt());
        
        List<OrderItemResponse> items = order.getItems().stream()
            .map(this::mapToOrderItemResponse)
            .collect(Collectors.toList());
        
        response.setItems(items);
        response.setItemCount(items.size()); // Thêm số lượng sản phẩm
        
        return response;
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setProductId(item.getProduct().getId());
        response.setName(item.getProduct().getName());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        return response;
    }
    
    private List<OrderItem> createOrderItems(Order order, List<OrderItemRequest> itemRequests) {
        return itemRequests.stream()
            .map(item -> {
                Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Không tìm thấy sản phẩm với ID: " + item.getProductId()));
    
                if (product.getStock() < item.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Sản phẩm " + product.getName() + " không đủ số lượng trong kho");
                }
    
                // Update product stock
                product.setStock(product.getStock() - item.getQuantity());
                productRepository.save(product);
    
                // Create order item
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(item.getQuantity());
                orderItem.setPrice(product.getPrice());
                return orderItem;
            })
            .collect(Collectors.toList());
    }
}