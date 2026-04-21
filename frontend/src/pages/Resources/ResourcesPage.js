import { useEffect, useState } from "react";
import resourceService from "../../services/resourceService";
import ResourceList from "./components/ResourceList";

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a placeholder for actual API call
    // In actual implementation, we would call an API matching: resourceService.endpoint
    setTimeout(() => {
      setResources([
        { id: 1, name: "Lecture Hall A", type: "Lecture Hall", capacity: 150, location: "Main Building", status: "ACTIVE" },
        { id: 2, name: "Computer Lab 1", type: "Lab", capacity: 40, location: "IT Building", status: "OUT_OF_SERVICE" },
        { id: 3, name: "Projector X1", type: "Equipment", capacity: null, location: "Storage Room B", status: "ACTIVE" }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <section className="page-card" style={{ padding: '20px' }}>
      <h1>Facilities & Assets Catalogue</h1>
      <p>
        Browse and manage bookable resources such as lecture halls, labs, rooms, and equipment.
      </p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Available Resources</h2>
        {loading ? (
          <p>Loading resources...</p>
        ) : (
          <ResourceList resources={resources} />
        )}
      </div>
    </section>
  );
}

export default ResourcesPage;
