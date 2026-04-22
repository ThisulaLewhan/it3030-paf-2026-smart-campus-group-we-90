import React from 'react';

function ResourceCard({ resource }) {
  // Utility for status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#e6f4ea', text: '#137333' };
      case 'OUT_OF_SERVICE': return { bg: '#fce8e6', text: '#c5221f' };
      default: return { bg: '#f1f3f4', text: '#5f6368' };
    }
  };

  const statusStyle = getStatusColor(resource.status);

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>{resource.name}</h3>
        <span style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.text,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {resource.status}
        </span>
      </div>
      
      <div style={{ color: '#666', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{ margin: 0 }}><strong>Type:</strong> {resource.type}</p>
        <p style={{ margin: 0 }}><strong>Capacity:</strong> {resource.capacity} people</p>
        <p style={{ margin: 0 }}><strong>Location:</strong> {resource.location}</p>
      </div>
    </div>
  );
}

export default ResourceCard;
