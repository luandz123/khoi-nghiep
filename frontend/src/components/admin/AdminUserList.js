import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Typography
} from '@mui/material';
import axiosInstance from '../../utils/axiosConfig';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    axiosInstance.get('/admin/users') // Không cần thêm "/api" vì baseURL đã có
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error fetching users');
        setLoading(false);
      });
  }, []);

  const handleUpdateRoleDialog = (user) => setSelectedUser(user);

  const handleSaveRole = () => {
    axiosInstance.put(`/admin/users/${selectedUser.id}`, { role: selectedUser.role })
      .then(response => {
        setUsers(users.map(u => u.id === response.data.id ? response.data : u));
        setSelectedUser(null);
      })
      .catch(err => console.error('Error updating user:', err));
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Danh sách Người Dùng</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleUpdateRoleDialog(user)}>Cập nhật</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedUser && (
        <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)}>
          <DialogTitle>Cập nhật Quyền Người Dùng</DialogTitle>
          <DialogContent>
            <TextField
              label="Role"
              value={selectedUser.role}
              onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedUser(null)}>Hủy</Button>
            <Button variant="contained" color="primary" onClick={handleSaveRole}>Lưu</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminUserList;