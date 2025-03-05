import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [totalElements, setTotalElements] = useState(0);

  // Dialog for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null });
  // Dialog for add/edit product form
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image: null
  });
  
  // List of categories; adjust as needed
  const [categories] = useState(['Sách', 'Laptop', 'Phím cơ', 'Chuột gaming', 'Tai nghe']);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query parameters; omit category if "all" selected.
      const params = {
        page,
        size: rowsPerPage,
        search: search.trim()
      };
      if (category !== 'all') {
        params.category = category;
      }
      const response = await axiosInstance.get('/admin/products', { params });
      // The backend returns a page object with "content" and "totalElements"
      setProducts(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      const errMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách sản phẩm';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, category, search]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(0);
  };

  const openAddForm = () => {
    setIsEdit(false);
    setCurrentProductId(null);
    setProductFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      description: '',
      image: null
    });
    setOpenFormDialog(true);
  };

  const openEditForm = (product) => {
    setIsEdit(true);
    setCurrentProductId(product.id);
    setProductFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description,
      image: null // Let user optionally choose a new image
    });
    setOpenFormDialog(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setProductFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(productFormData).forEach(key => {
        if (productFormData[key] !== null) {
          formData.append(key, productFormData[key]);
        }
      });
      if (isEdit) {
        await axiosInstance.put(`/admin/products/${currentProductId}`, formData);
      } else {
        await axiosInstance.post('/admin/products', formData);
      }
      fetchProducts();
      setOpenFormDialog(false);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Không thể lưu sản phẩm');
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axiosInstance.delete(`/admin/products/${productId}`);
      fetchProducts();
      setDeleteDialog({ open: false, productId: null });
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Quản lý sản phẩm
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Tìm kiếm sản phẩm..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearch}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} /> }}
          sx={{ flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select value={category} onChange={handleCategoryChange} label="Danh mục">
            <MenuItem value="all">Tất cả</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddForm}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1AC6E9 90%)',
              transform: 'scale(1.02)',
              transition: 'all 0.2s ease'
            }
          }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell align="right">Giá (VNĐ)</TableCell>
              <TableCell align="right">Tồn kho</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} sx={{ '&:hover': { backgroundColor: 'action.hover', transition: 'background-color 0.2s ease' } }}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <img src={product.imageUrl} alt={product.name} width={80} />
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </TableCell>
                <TableCell align="right">{product.stock}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Chỉnh sửa">
                    <IconButton color="primary" onClick={() => openEditForm(product)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton color="error" onClick={() => setDeleteDialog({ open: true, productId: product.id })}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số hàng mỗi trang"
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, productId: null })}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa sản phẩm này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, productId: null })}>Hủy</Button>
          <Button onClick={() => handleDelete(deleteDialog.productId)} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Form Dialog */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên sản phẩm"
                  name="name"
                  value={productFormData.name}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Giá"
                  name="price"
                  type="number"
                  value={productFormData.price}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tồn kho"
                  name="stock"
                  type="number"
                  value={productFormData.stock}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="category"
                    value={productFormData.category}
                    onChange={handleFormChange}
                    label="Danh mục"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  value={productFormData.description}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label">
                  {productFormData.image ? 'Đã chọn file' : 'Chọn hình ảnh'}
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFormDialog(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminProductList;