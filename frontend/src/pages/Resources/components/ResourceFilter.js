import React, { useState } from 'react';

function ResourceFilter({ onSearch, onClear }) {
  const [filters, setFilters] = useState({
    type: '',
    capacity: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({ type: '', capacity: '', location: '' });
    onClear();
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Type</label>
        <select 
          name="type" 
          value={filters.type} 
          onChange={handleChange}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Lab</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Min Capacity</label>
        <input 
          type="number" 
          name="capacity" 
          value={filters.capacity} 
          onChange={handleChange} 
          placeholder="e.g. 50"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Location</label>
        <input 
          type="text" 
          name="location" 
          value={filters.location} 
          onChange={handleChange} 
          placeholder="e.g. Main Building"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleSearch}
          style={{ padding: '9px 16px', backgroundColor: '#137333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Search
        </button>
        <button 
          onClick={handleClear}
          style={{ padding: '9px 16px', backgroundColor: '#f1f3f4', color: '#333', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default ResourceFilter;
