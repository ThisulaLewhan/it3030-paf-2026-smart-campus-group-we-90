import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import ResourceList from './components/ResourceList';
import ResourceForm from './components/ResourceForm';

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

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

  const handleResourceSaved = () => {
    setShowAddForm(false);
    setEditingResource(null);
    fetchResources();
  };

  const handleEditClick = (resource) => {
    setEditingResource(resource);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingResource(null);
  };

  return (
    <section style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>Facilities &amp; Assets Catalogue</h1>
          <p style={{ margin: 0, color: '#7f8c8d' }}>
            Browse and manage all available campus resources including rooms, labs, and equipment.
          </p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => { setEditingResource(null); setShowAddForm(true); }}
            style={{ padding: '10px 16px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Add Resource
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {showAddForm && (
        <ResourceForm 
          initialData={editingResource}
          onResourceSaved={handleResourceSaved} 
          onCancel={handleCancelForm} 
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading resources...
        </div>
      ) : (
        <ResourceList resources={resources} onEdit={handleEditClick} />
      )}
    </section>
  );
}

export default ResourcesPage;
