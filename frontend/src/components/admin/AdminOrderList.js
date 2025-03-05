import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { 
  MagnifyingGlassIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

const OrderStatus = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Đã thanh toán', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn tất', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await axiosInstance.get('/admin/orders', { params });
      setOrders(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/orders/${orderId}/status`, { 
        status: newStatus 
      });
      await fetchOrders();
      setDropdownOpen(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Quản lý đơn hàng</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-22 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <MagnifyingGlassIcon className="h-1 w-1 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(OrderStatus).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500">
          Không có đơn hàng nào
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">#{order.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{order.customerName}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === order.id ? null : order.id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${OrderStatus[order.status].color}`}
                      >
                        {OrderStatus[order.status].label}
                        <ChevronDownIcon className="ml-1 h-3 w-3" />
                      </button>
                      {dropdownOpen === order.id && (
                        <div className="absolute z-10 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            {Object.entries(OrderStatus).map(([status, { label, color }]) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(order.id, status)}
                                className={`block w-full text-left px-3 py-1 text-xs hover:bg-gray-100 ${color}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-sm text-center">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === order.id ? null : order.id)}
                      className="text-indigo-600 hover:text-indigo-900 text-xs"
                    >
                      Cập nhật
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;