import React, { useState, useEffect } from 'react';
import './UserProfileUpdatePage.css';

const UserProfileUpdatePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [preview, setPreview] = useState('');

  // Fetch current user info to pre-populate the form
  useEffect(() => {
    fetch('http://localhost:8080/api/user/info', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // adjust as needed
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setEmail(data.email);
        setAvatar(data.avatar);
        setPreview(data.avatar);
      })
      .catch((error) => console.error('Error fetching user info:', error));
  }, []);

  // Handle file upload for avatar and convert to Base64 string
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit updated info to API
  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = { name, email, avatar };
    fetch('http://localhost:8080/api/user/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // adjust as needed
      },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (res.ok) {
          alert('Cập nhật thành công');
        } else {
          alert('Cập nhật thất bại');
        }
      })
      .catch((err) => console.error('Error updating user', err));
  };

  const handleCancel = () => {
    window.location.reload(); // or navigate away as needed
  };

  return (
    <div className="update-page">
      <form onSubmit={handleSubmit} className="update-form">
        <div className="form-group">
          <label>Tên:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Ảnh đại diện:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        {preview && (
          <div className="avatar-preview">
            <img src={preview} alt="avatar preview" />
          </div>
        )}
        <div className="button-group">
          <button type="submit" className="save-button">
            Lưu thay đổi
          </button>
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileUpdatePage;