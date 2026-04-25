import React from 'react';
import ResourceCard from './ResourceCard';

function ResourceList({ resources, onEdit, onDelete, isAdmin }) {
  if (!resources || resources.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', marginTop: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '20px' }}>No resources found</h3>
        <p style={{ margin: 0, fontSize: '15px' }}>Try adjusting your search filters or add a new resource.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '20px'
    }}>
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} />
      ))}
    </div>
  );
}

export default ResourceList;
