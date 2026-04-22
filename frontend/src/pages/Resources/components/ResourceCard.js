import React from 'react';

function ResourceCard({ resource, onEdit, onDelete }) {
  // Utility for status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'OUT_OF_SERVICE': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
      default: return { bg: '#f1f3f4', text: '#5f6368', border: '#dadce0' };
    }
  };

  const statusStyle = getStatusColor(resource.status);

  return (
    <div 
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '600' }}>{resource.name}</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.02em'
          }}>
            {resource.status}
          </span>
        </div>
      </div>
      
      <div style={{ color: '#475569', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ margin: 0 }}>
          <span style={{ color: '#94a3b8', display: 'inline-block', width: '70px' }}>Type:</span> 
          <span style={{ fontWeight: '500' }}>{resource.type.replace('_', ' ')}</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: '#94a3b8', display: 'inline-block', width: '70px' }}>Capacity:</span> 
          <span style={{ fontWeight: '500' }}>{resource.capacity} people</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: '#94a3b8', display: 'inline-block', width: '70px' }}>Location:</span> 
          <span style={{ fontWeight: '500' }}>{resource.location}</span>
        </p>
        {(resource.availabilityStart || resource.availabilityEnd) && (
          <p style={{ margin: 0 }}>
            <span style={{ color: '#94a3b8', display: 'inline-block', width: '70px' }}>Available:</span> 
            <span style={{ fontWeight: '500' }}>
              {resource.availabilityStart ? resource.availabilityStart.substring(0, 5) : 'Any'} 
              {' - '} 
              {resource.availabilityEnd ? resource.availabilityEnd.substring(0, 5) : 'Any'}
            </span>
          </p>
        )}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px', gap: '8px' }}>
         <button 
            onClick={() => onEdit(resource)}
            style={{ padding: '8px 16px', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
         >
           Edit
         </button>
         <button 
            onClick={() => onDelete(resource.id)}
            style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
         >
           Delete
         </button>
      </div>
    </div>
  );
}

export default ResourceCard;
