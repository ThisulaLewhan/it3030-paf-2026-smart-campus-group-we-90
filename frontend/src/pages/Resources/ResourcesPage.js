import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import ResourceList from './components/ResourceList';

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getAll();
      setResources(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Facilities &amp; Assets Catalogue</h1>
        <p style={{ margin: 0, color: '#7f8c8d' }}>
          Browse all available campus resources including rooms, labs, and equipment.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading resources...
        </div>
      ) : (
        <ResourceList resources={resources} />
      )}
    </section>
  );
}

export default ResourcesPage;
