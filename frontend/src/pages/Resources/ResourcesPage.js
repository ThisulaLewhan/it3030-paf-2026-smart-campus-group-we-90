import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import ResourceList from './components/ResourceList';
import ResourceForm from './components/ResourceForm';
import ResourceFilter from './components/ResourceFilter';
import { useAuth } from '../../context/AuthContext';

function ResourcesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async (searchParams = null) => {
    try {
      setLoading(true);
      let response;
      
      if (searchParams && (searchParams.type || searchParams.capacity || searchParams.location)) {
        // filter out empty params
        const params = {};
        if (searchParams.type) params.type = searchParams.type;
        if (searchParams.capacity) params.capacity = searchParams.capacity;
        if (searchParams.location) params.location = searchParams.location;
        
        response = await resourceService.search(params);
      } else {
        response = await resourceService.getAll();
      }
      
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

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      try {
        setLoading(true);
        await resourceService.remove(id);
        fetchResources(); // refresh list
      } catch (err) {
        console.error("Error deleting resource:", err);
        setError("Failed to delete resource. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleSearch = (filters) => {
    fetchResources(filters);
  };

  const handleClearFilters = () => {
    fetchResources();
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
        {!showAddForm && isAdmin && (
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

      {!showAddForm && (
        <ResourceFilter onSearch={handleSearch} onClear={handleClearFilters} />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <style>
            {`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}
          </style>
          <div style={{ 
            width: '40px', height: '40px', 
            border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', animation: 'spin 1s linear infinite' 
          }} />
          <span style={{ fontSize: '16px', fontWeight: '500' }}>Loading resources...</span>
        </div>
      ) : (
        <ResourceList resources={resources} onEdit={handleEditClick} onDelete={handleDeleteClick} isAdmin={isAdmin} />
      )}
    </section>
  );
}

export default ResourcesPage;
