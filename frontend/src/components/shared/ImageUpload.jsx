import React, { useState, useRef } from 'react';
import { eventService } from '../../services/eventService';
import './ImageUpload.css';

const ImageUpload = ({ onImageSelect, currentImage }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      // Make sure we're using the correct field name that matches the backend
      formData.append('image', file, file.name);

      // Debug log FormData contents
      console.log('FormData contents before upload:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await eventService.uploadEventImage(formData);
      console.log('Image upload response:', response);

      if (response.imageUrl) {
        setSelectedFile(file);
        setPreviewUrl(response.imageUrl);
        onImageSelect(response.imageUrl);
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await eventService.uploadEventImage(formData);
      console.log('Image upload response:', response);

      if (response.imageUrl) {
        setSelectedFile(file);
        setPreviewUrl(response.imageUrl);
        onImageSelect(response.imageUrl);
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="image-upload-container">
      <div
        className="image-upload-box"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        {loading ? (
          <div className="upload-placeholder">
            <div className="loading-spinner"></div>
            <p>Uploading...</p>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="image-preview"
            onError={(e) => {
              console.error('Error loading image:', e);
              setError('Error loading image');
              setPreviewUrl('');
            }}
          />
        ) : (
          <div className="upload-placeholder">
            <i className="fas fa-cloud-upload-alt upload-icon"></i>
            <p>Drag and drop an image here or click to select</p>
            <p className="upload-hint">Supported formats: JPG, PNG, GIF (max 5MB)</p>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ImageUpload; 