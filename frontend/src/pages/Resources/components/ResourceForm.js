import React, { useState } from 'react';
import resourceService from '../../../services/resourceService';

function ResourceForm({ onResourceSaved, onCancel, initialData }) {
  const isEditing = !!initialData;
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // Extracts "HH:mm" from "HH:mm:ss"
  };

  const [formData, setFormData] = useState(initialData ? {
    ...initialData,
    availabilityStart: formatTime(initialData.availabilityStart),
    availabilityEnd: formatTime(initialData.availabilityEnd),
  } : {
    name: '',
    type: 'LECTURE_HALL',
    capacity: 1,
    location: '',
    availabilityStart: '',
    availabilityEnd: '',
    status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be greater than 0';
    
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    else if (formData.location.length < 2) newErrors.location = 'Location must be at least 2 characters';

    // Time validation (optional but good if both or neither are provided)
    if (formData.availabilityStart && formData.availabilityEnd) {
      if (formData.availabilityStart >= formData.availabilityEnd) {
        newErrors.time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      
      // Format payload properly
      const payload = { ...formData };
      if (!payload.availabilityStart) payload.availabilityStart = null;
      if (!payload.availabilityEnd) payload.availabilityEnd = null;
      if (payload.capacity) payload.capacity = parseInt(payload.capacity, 10);

      if (isEditing) {
        await resourceService.update(initialData.id, payload);
      } else {
        await resourceService.create(payload);
      }
      onResourceSaved();
    } catch (err) {
      console.error("Error saving resource:", err);
      // Map global error from response if available
      if (err.response && err.response.data && err.response.data.error) {
         setErrors({ global: err.response.data.error });
      } else {
         setErrors({ global: "Failed to save resource. Please check inputs and try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>{isEditing ? 'Edit Resource' : 'Add New Resource'}</h2>
      
      {errors.global && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px' }}>
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Name *</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: errors.name ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.name && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.name}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Type *</label>
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Capacity *</label>
          <input 
            type="number" 
            name="capacity" 
            value={formData.capacity} 
            onChange={handleChange} 
            min="1"
            style={{ padding: '8px', borderRadius: '4px', border: errors.capacity ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.capacity && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.capacity}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Location *</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: errors.location ? '1px solid red' : '1px solid #ccc' }}
          />
          {errors.location && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.location}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Availability Start</label>
          <input 
            type="time" 
            name="availabilityStart" 
            value={formData.availabilityStart} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Availability End</label>
          <input 
            type="time" 
            name="availabilityEnd" 
            value={formData.availabilityEnd} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {errors.time && <div style={{ gridColumn: 'span 2', color: 'red', fontSize: '12px' }}>{errors.time}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <label style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Status *</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button 
            type="button" 
            onClick={onCancel}
            style={{ padding: '10px 16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ padding: '10px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#137333', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Resource' : 'Save Resource')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResourceForm;
