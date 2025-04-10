import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    Tooltip,
    Alert,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Add as AddIcon
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
        originalPrice: '',
        discount: '',
        type: 'tech',
        stock: '',
        category: '',
        description: '',
        image: null
    });

    // Product types from our backend
    const productTypes = [
        { id: 'tech', name: 'Sản phẩm công nghệ' },
        { id: 'course', name: 'Khóa học' },
        { id: 'book', name: 'Sách IT' },
        { id: 'source', name: 'Source code' }
    ];

    // List of categories; this should ideally come from the backend
    const [categories, setCategories] = useState([
        'Laptop', 'Phụ kiện', 'Sách IT', 'Khóa học', 'Source code', 'Màn hình'
    ]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/categories');
            if (response.data && Array.isArray(response.data)) {
                setCategories(response.data.map(cat => cat.name));
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: rowsPerPage,
                search: search.trim()
            };
            if (category !== 'all') {
                params.category = category;
            }
            const response = await axiosInstance.get('/admin/products', { params });
            
            // The backend returns a page object with "content" and "totalElements"
            if (response.data) {
                setProducts(response.data.content || []);
                setTotalElements(response.data.totalElements || 0);
                setError('');
            }
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
            originalPrice: '',
            discount: '',
            type: 'tech',
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
            name: product.name || '',
            price: product.price || '',
            originalPrice: product.originalPrice || '',
            discount: product.discount || 0,
            type: product.type || 'tech',
            stock: product.stock || 0,
            category: product.category || '',
            description: product.description || '',
            image: null
        });
        setOpenFormDialog(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setProductFormData({
            ...productFormData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProductFormData({
                ...productFormData,
                image: e.target.files[0]
            });
        }
    };

    const calculateDiscount = () => {
        if (productFormData.originalPrice && productFormData.price) {
            const originalPrice = parseFloat(productFormData.originalPrice);
            const currentPrice = parseFloat(productFormData.price);
            
            if (originalPrice > currentPrice) {
                const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                return discountPercent;
            }
        }
        return 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            // Create the product request object
            const productRequest = {
                name: productFormData.name,
                price: parseFloat(productFormData.price),
                originalPrice: parseFloat(productFormData.originalPrice) || parseFloat(productFormData.price),
                discount: parseInt(productFormData.discount) || calculateDiscount(),
                type: productFormData.type,
                stock: parseInt(productFormData.stock),
                category: productFormData.category,
                description: productFormData.description
            };
            
            // Add the product JSON as a blob to the FormData
            formData.append('product', new Blob([JSON.stringify(productRequest)], { type: 'application/json' }));
            
            // Add the image if present
            if (productFormData.image) {
                formData.append('image', productFormData.image);
            }
    
            if (isEdit) {
                await axiosInstance.put(`/admin/products/${currentProductId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axiosInstance.post('/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
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

    if (loading && products.length === 0) {
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
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'action.active', mr: 1 }} /></InputAdornment> }}
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
                            <TableRow
                                key={product.id}
                                sx={{ '&:hover': { backgroundColor: 'action.hover', transition: 'background-color 0.2s ease' } }}
                            >
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
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Giá hiện tại"
                                    name="price"
                                    type="number"
                                    value={productFormData.price}
                                    onChange={handleFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                                    }}
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Giá gốc"
                                    name="originalPrice"
                                    type="number"
                                    value={productFormData.originalPrice}
                                    onChange={handleFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                                    }}
                                    helperText="Nếu để trống, sẽ dùng giá hiện tại"
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Loại sản phẩm</InputLabel>
                                    <Select
                                        name="type"
                                        value={productFormData.type}
                                        onChange={handleFormChange}
                                        label="Loại sản phẩm"
                                    >
                                        {productTypes.map(type => (
                                            <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Số lượng trong kho"
                                    name="stock"
                                    type="number"
                                    value={productFormData.stock}
                                    onChange={handleFormChange}
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Danh mục</InputLabel>
                                    <Select
                                        name="category"
                                        value={productFormData.category}
                                        onChange={handleFormChange}
                                        label="Danh mục"
                                    >
                                        {categories.map(cat => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Mô tả sản phẩm"
                                    name="description"
                                    value={productFormData.description}
                                    onChange={handleFormChange}
                                    multiline
                                    rows={4}
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Button variant="outlined" component="label">
                                    {productFormData.image ? 'Đã chọn file' : 'Chọn hình ảnh'}
                                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                </Button>
                            </Grid>
                            
                            {/* Preview image */}
                            <Grid item xs={12}>
                                {productFormData.image && (
                                    <Box mt={2}>
                                        <img
                                            src={URL.createObjectURL(productFormData.image)}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                                        />
                                    </Box>
                                )}
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