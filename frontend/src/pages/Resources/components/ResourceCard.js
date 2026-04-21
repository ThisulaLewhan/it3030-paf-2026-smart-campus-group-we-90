import React from 'react';

function ResourceCard({ resource }) {
  return (
    <div className="resource-card" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0 }}>{resource.name || 'Unnamed Resource'}</h3>
      <p><strong>Type:</strong> {resource.type}</p>
      <p><strong>Capacity:</strong> {resource.capacity || 'N/A'}</p>
      <p><strong>Location:</strong> {resource.location}</p>
      <span style={{ 
        display: 'inline-block', 
        padding: '4px 8px', 
        borderRadius: '12px', 
        fontSize: '12px',
        backgroundColor: resource.status === 'ACTIVE' ? '#e6f4ea' : '#fce8e6',
        color: resource.status === 'ACTIVE' ? '#137333' : '#c5221f'
      }}>
        {resource.status || 'UNKNOWN'}
      </span>
    </div>
  );
}

export default ResourceCard;
