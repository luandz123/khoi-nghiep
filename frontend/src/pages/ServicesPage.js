import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesPage.css';

const ServicesPage = () => {
  const services = [
    {
      id: 1,
      title: 'Thiết kế Website Doanh Nghiệp',
      description: 'Tạo website chuyên nghiệp, hiện đại và đáp ứng hoàn hảo cho doanh nghiệp của bạn.',
      image: 'https://via.placeholder.com/400x250?text=Website+Design',
      price: 'Từ 5.000.000đ',
      features: [
        'Thiết kế đáp ứng trên mọi thiết bị',
        'Tối ưu SEO cơ bản',
        'Giao diện hiện đại, chuyên nghiệp',
        'Hỗ trợ kỹ thuật 3 tháng'
      ]
    },
    {
      id: 2,
      title: 'Thiết kế Website Thương mại điện tử',
      description: 'Xây dựng cửa hàng trực tuyến đầy đủ tính năng giúp bạn bán hàng hiệu quả.',
      image: 'https://via.placeholder.com/400x250?text=E-commerce',
      price: 'Từ 10.000.000đ',
      features: [
        'Hệ thống quản lý sản phẩm',
        'Giỏ hàng & thanh toán trực tuyến',
        'Tích hợp đa kênh bán hàng',
        'Báo cáo doanh thu, đơn hàng'
      ]
    },
    {
      id: 3,
      title: 'Phát triển Ứng dụng Web',
      description: 'Xây dựng các ứng dụng web động với React, Angular hoặc Vue tùy theo yêu cầu.',
      image: 'https://via.placeholder.com/400x250?text=Web+App',
      price: 'Từ 15.000.000đ',
      features: [
        'Frontend hiện đại (React, Angular, Vue)',
        'Backend với Node.js hoặc PHP',
        'Tối ưu hóa hiệu suất',
        'Kiểm thử đa nền tảng'
      ]
    },
    {
      id: 4,
      title: 'Bảo trì & Nâng cấp Website',
      description: 'Dịch vụ bảo trì, cập nhật và tối ưu website hiện có để đảm bảo an toàn và hiệu quả.',
      image: 'https://via.placeholder.com/400x250?text=Maintenance',
      price: 'Từ 1.000.000đ/tháng',
      features: [
        'Cập nhật hệ thống thường xuyên',
        'Sao lưu dữ liệu định kỳ',
        'Khắc phục sự cố nhanh chóng',
        'Tối ưu hóa hiệu suất'
      ]
    }
  ];

  return (
    <div className="services-page">
      <div className="services-banner">
        <div className="services-overlay"></div>
        <div className="services-content">
          <h1>Dịch vụ Freelance Website</h1>
          <p>Chuyên thiết kế và phát triển website theo yêu cầu với chất lượng cao và giá cả hợp lý</p>
        </div>
      </div>

      <div className="services-container">
        <div className="services-intro">
          <h2>Dịch vụ của chúng tôi</h2>
          <p>
            Với hơn 5 năm kinh nghiệm trong lĩnh vực phát triển web, chúng tôi cung cấp các giải pháp
            website hoàn chỉnh giúp doanh nghiệp của bạn tỏa sáng trên không gian mạng.
          </p>
        </div>

        <div className="services-grid">
          {services.map(service => (
            <div className="service-card" key={service.id}>
              <div className="service-image">
                <img src={service.image} alt={service.title} />
              </div>
              <div className="service-info">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-price">{service.price}</div>
                <ul className="service-features">
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <div className="contact-tooltip service-contact">
                  <button className="service-btn">Liên hệ báo giá</button>
                  <span className="tooltiptext">0123 456 789</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="services-workflow">
          <h2>Quy trình làm việc</h2>
          <div className="workflow-container">
            <div className="workflow-item">
              <div className="workflow-number">1</div>
              <h3>Trao đổi yêu cầu</h3>
              <p>Lắng nghe và phân tích nhu cầu của khách hàng</p>
            </div>
            <div className="workflow-item">
              <div className="workflow-number">2</div>
              <h3>Thiết kế & Báo giá</h3>
              <p>Đề xuất giải pháp và mức chi phí phù hợp</p>
            </div>
            <div className="workflow-item">
              <div className="workflow-number">3</div>
              <h3>Phát triển</h3>
              <p>Thực hiện xây dựng theo yêu cầu đã thống nhất</p>
            </div>
            <div className="workflow-item">
              <div className="workflow-number">4</div>
              <h3>Bàn giao & Hỗ trợ</h3>
              <p>Chuyển giao sản phẩm và hỗ trợ kỹ thuật</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;