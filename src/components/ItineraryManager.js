import React, { useState, useEffect } from 'react';
import './ItineraryManager.css';

const ItineraryManager = ({ user, isAuthenticated }) => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    locations: []
  });

  // Fetch user's itineraries on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchItineraries();
    }
  }, [isAuthenticated]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/itineraries', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setItineraries(data.itineraries);
      } else {
        setError('Failed to load itineraries');
      }
    } catch (err) {
      setError('Error loading itineraries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setItineraries([data.itinerary, ...itineraries]);
        setFormData({ title: '', date: '', locations: [] });
        setShowForm(false);
        setError('');
      } else {
        setError('Failed to create itinerary');
      }
    } catch (err) {
      setError('Error creating itinerary: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      const response = await fetch(`/api/itineraries/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setItineraries(itineraries.filter(it => it._id !== id));
      } else {
        setError('Failed to delete itinerary');
      }
    } catch (err) {
      setError('Error deleting itinerary: ' + err.message);
    }
  };

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      locations: [
        ...prev.locations,
        {
          setName: '',
          address: '',
          startTime: '',
          endTime: '',
          contactName: '',
          contactPhone: '',
          notes: ''
        }
      ]
    }));
  };

  const updateLocation = (index, field, value) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[index][field] = value;
    setFormData(prev => ({
      ...prev,
      locations: updatedLocations
    }));
  };

  const removeLocation = (index) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="itinerary-manager">
        <p>Please log in to manage your itineraries.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="itinerary-manager">
        <div className="loading">Loading itineraries...</div>
      </div>
    );
  }

  return (
    <div className="itinerary-manager">
      <div className="itinerary-header">
        <h2>My Itineraries</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Itinerary'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {showForm && (
        <div className="itinerary-form">
          <h3>Create New Itinerary</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Location Scout"
                required
              />
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="locations-section">
              <div className="locations-header">
                <h4>Locations</h4>
                <button type="button" onClick={addLocation} className="btn-secondary">
                  + Add Location
                </button>
              </div>

              {formData.locations.map((location, index) => (
                <div key={index} className="location-form">
                  <div className="location-form-header">
                    <h5>Location {index + 1}</h5>
                    <button 
                      type="button" 
                      onClick={() => removeLocation(index)}
                      className="btn-danger-small"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Set Name</label>
                      <input
                        type="text"
                        value={location.setName}
                        onChange={(e) => updateLocation(index, 'setName', e.target.value)}
                        placeholder="e.g., Coffee Shop Scene"
                      />
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={location.address}
                        onChange={(e) => updateLocation(index, 'address', e.target.value)}
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={location.startTime}
                        onChange={(e) => updateLocation(index, 'startTime', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={location.endTime}
                        onChange={(e) => updateLocation(index, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        type="text"
                        value={location.contactName}
                        onChange={(e) => updateLocation(index, 'contactName', e.target.value)}
                        placeholder="Contact person"
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        value={location.contactPhone}
                        onChange={(e) => updateLocation(index, 'contactPhone', e.target.value)}
                        placeholder="555-1234"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={location.notes}
                      onChange={(e) => updateLocation(index, 'notes', e.target.value)}
                      placeholder="Additional notes..."
                      rows="3"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Create Itinerary
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="itinerary-list">
        {itineraries.length === 0 ? (
          <div className="empty-state">
            <p>No itineraries yet. Create your first one!</p>
          </div>
        ) : (
          itineraries.map(itinerary => (
            <div key={itinerary._id} className="itinerary-card">
              <div className="itinerary-card-header">
                <h3>{itinerary.title}</h3>
                <button 
                  className="btn-danger"
                  onClick={() => handleDelete(itinerary._id)}
                >
                  Delete
                </button>
              </div>
              <p className="itinerary-date">
                {new Date(itinerary.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="itinerary-locations">
                <h4>{itinerary.locations.length} Location(s)</h4>
                {itinerary.locations.map((location, index) => (
                  <div key={index} className="location-item">
                    <strong>{location.setName}</strong>
                    <p>{location.address}</p>
                    {location.startTime && (
                      <p className="time-range">
                        {location.startTime} - {location.endTime}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="itinerary-meta">
                <small>
                  Created: {new Date(itinerary.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItineraryManager;
