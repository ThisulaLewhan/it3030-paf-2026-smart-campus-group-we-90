import React from 'react';
import ResourceCard from './ResourceCard';

function ResourceList({ resources, onEdit }) {
  if (!resources || resources.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        No resources found.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    }}>
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} onEdit={onEdit} />
      ))}
    </div>
  );
}

export default ResourceList;
