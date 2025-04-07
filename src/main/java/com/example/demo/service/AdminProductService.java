package com.example.demo.service;

import com.example.demo.dto.ProductRequest;
import com.example.demo.dto.ProductResponse;
import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
public class AdminProductService {
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    
    // Folder where image files are stored
    private final String IMAGE_FOLDER = "C:\\Users\\lenovo\\OneDrive\\Desktop\\demo\\frontend\\public\\img\\imgproducts";

    public Page<ProductResponse> getAllProducts(String category, String search, Pageable pageable) {
        return productRepository.findByFilters(
                category != null && category.equals("all") ? null : category,
                search != null && search.trim().isEmpty() ? null : search,
                pageable)
            .map(product -> modelMapper.map(product, ProductResponse.class));
    }

    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
        return modelMapper.map(product, ProductResponse.class);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile imageFile) {
        Product product = modelMapper.map(request, Product.class);
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = saveImageFile(imageFile);
            product.setImageUrl(imageUrl);
        }
        product = productRepository.save(product);
        return modelMapper.map(product, ProductResponse.class);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile imageFile) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        modelMapper.map(request, product);
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = saveImageFile(imageFile);
            product.setImageUrl(imageUrl);
        }
        product = productRepository.save(product);
        return modelMapper.map(product, ProductResponse.class);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
        }
        productRepository.deleteById(id);
    }
    
  private String saveImageFile(MultipartFile file) {
    try {
        File dir = new File(IMAGE_FOLDER);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        String originalFilename = file.getOriginalFilename();
        // Tạo tên file duy nhất: nối thêm thời gian hiện tại.
        String uniqueFilename = System.currentTimeMillis() + "_" + originalFilename;
        Path destination = Path.of(IMAGE_FOLDER, uniqueFilename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        // Trả về URL tương đối để frontend truy cập
        return "/img/imgproducts/" + uniqueFilename;
    } catch (IOException e) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving image file", e);
    }
}
}