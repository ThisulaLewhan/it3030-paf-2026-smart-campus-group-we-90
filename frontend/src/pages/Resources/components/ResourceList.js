import React from 'react';
import ResourceCard from './ResourceCard';

function ResourceList({ resources }) {
  if (!resources || resources.length === 0) {
    return <div className="text-gray-500">No resources found.</div>;
  }

  return (
    <div className="resource-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}

export default ResourceList;
