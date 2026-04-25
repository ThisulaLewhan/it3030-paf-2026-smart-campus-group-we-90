import React from 'react';

function ResourceCard({ resource, onEdit, onDelete, isAdmin }) {
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
        padding: '16px 20px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)';
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '17px', color: '#1e293b', fontWeight: '600' }}>{resource.name}</h3>
          <span style={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.02em'
          }}>
            {resource.status}
          </span>
        </div>
        
        <div style={{ color: '#475569', fontSize: '13px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span><strong>Type:</strong> {resource.type.replace('_', ' ')}</span>
          <span>•</span>
          <span><strong>Location:</strong> {resource.location}</span>
          <span>•</span>
          <span><strong>Capacity:</strong> {resource.capacity}</span>
          {(resource.availabilityStart || resource.availabilityEnd) && (
            <>
              <span>•</span>
              <span>
                <strong>Available:</strong> {resource.availabilityStart ? resource.availabilityStart.substring(0, 5) : 'Any'} - {resource.availabilityEnd ? resource.availabilityEnd.substring(0, 5) : 'Any'}
              </span>
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <div style={{ display: 'flex', gap: '8px' }}>
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
      )}
    </div>
  );
}

export default ResourceCard;
