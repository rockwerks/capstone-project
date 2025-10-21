import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ShareModal from './ShareModal';
import './ItineraryManager.css';

// Helper function to format time from 24-hour to 12-hour with AM/PM
const formatTime = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Sortable Location Item Component
const SortableLocationItem = ({ id, index, location, updateLocation, removeLocation }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="location-form">
      <div className="location-form-header">
        <div className="location-header-left">
          <button
            type="button"
            className="drag-handle"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            ⋮⋮
          </button>
          <h5>Location {index + 1}</h5>
        </div>
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
            placeholder="Location Name, 123 Main St, City, Province"
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
  );
};

const ItineraryManager = ({ user, isAuthenticated }) => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startLocation: {
      name: '',
      address: '',
      time: ''
    },
    endLocation: {
      name: '',
      address: '',
      time: ''
    },
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
      console.log('Fetched itineraries:', data);
      
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
    console.log(name, value);
    // This code isn't being called
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartLocationChange = (field, value) => {
   
    console.log('Start location change', field, value);
    setFormData(prev => ({
      ...prev,
      startLocation: {
        ...prev.startLocation,
        [field]: value
      }
    }));
  };

  const handleEndLocationChange = (field, value) => {
    // This code isn't being called
    console.log('End location change', field, value);
    setFormData(prev => ({
      ...prev,
      endLocation: {
        ...prev.endLocation,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/itineraries/${editingId}` : '/api/itineraries';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        if (editingId) {
          // Update existing itinerary in the list
          setItineraries(itineraries.map(it => 
            it._id === editingId ? data.itinerary : it
          ));
          fetchItineraries();
        } else {
          // Add new itinerary to the list
          setItineraries([data.itinerary, ...itineraries]);
        }
        
        // Reset form
        setFormData({ 
          title: '', 
          date: '', 
          startLocation: { name: '', address: '', time: '' },
          endLocation: { name: '', address: '', time: '' },
          locations: [] 
        });
        setShowForm(false);
        setEditingId(null);
        setError('');
      } else {
        setError(editingId ? 'Failed to update itinerary' : 'Failed to create itinerary');
      }
    } catch (err) {
      setError(`Error ${editingId ? 'updating' : 'creating'} itinerary: ${err.message}`);
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

  const handleEdit = (itinerary) => {
    // Format the date for the input field (YYYY-MM-DD)
    const formattedDate = new Date(itinerary.date).toISOString().split('T')[0];
    
    setFormData({
      title: itinerary.title,
      date: formattedDate,
      startLocation: itinerary.startLocation || { name: '', address: '', time: '' },
      endLocation: itinerary.endLocation || { name: '', address: '', time: '' },
      locations: itinerary.locations || []
    });
    setEditingId(itinerary._id);
    setShowForm(true);
    
    // Scroll to top of page to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({ 
      title: '', 
      date: '', 
      startLocation: { name: '', address: '', time: '' },
      endLocation: { name: '', address: '', time: '' },
      locations: [] 
    });
    setShowForm(false);
    setEditingId(null);
    setError('');
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
          notes: '',
          status: 'pending'
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

  const handleShare = (itinerary) => {
    setSelectedItinerary(itinerary);
    setShareModalOpen(true);
  };

  const handleShareComplete = (data) => {
    if (data.unshared) {
      // Update itinerary in list to remove shared status
      setItineraries(itineraries.map(it => 
        it._id === selectedItinerary._id 
          ? { ...it, isShared: false, shareToken: null }
          : it
      ));
    } else {
      // Update itinerary in list with shared status
      setItineraries(itineraries.map(it => 
        it._id === selectedItinerary._id 
          ? { ...it, isShared: true, sharedWith: data.sharedWith }
          : it
      ));
    }
    // Refresh itineraries to get updated data
    fetchItineraries();
  };

  const handleLocationStatus = async (itineraryId, locationIndex, newStatus) => {
    try {
      const itinerary = itineraries.find(it => it._id === itineraryId);
      if (!itinerary) return;

      // Update the location status
      const updatedLocations = [...itinerary.locations];
      updatedLocations[locationIndex] = {
        ...updatedLocations[locationIndex],
        status: newStatus
      };

      // Send update to server
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...itinerary,
          locations: updatedLocations
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setItineraries(itineraries.map(it => 
          it._id === itineraryId ? data.itinerary : it
        ));
      } else {
        setError('Failed to update location status');
      }
    } catch (err) {
      setError('Error updating location status: ' + err.message);
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering locations
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.locations.findIndex((_, index) => `location-${index}` === active.id);
      const newIndex = formData.locations.findIndex((_, index) => `location-${index}` === over.id);

      setFormData(prev => ({
        ...prev,
        locations: arrayMove(prev.locations, oldIndex, newIndex)
      }));
    }
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
        {!editingId && (
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Itinerary'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {showForm && (
        <div className="itinerary-form">
          <h3>{editingId ? '✏️ Edit Itinerary' : 'Create New Itinerary'}</h3>
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

            {/* Start Location Section */}
            <div className="special-location-section">
              <h4>📍 Starting Location (Production Office)</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Location Name</label>
                  <input
                    type="text"
                    value={formData.startLocation.name}
                    onChange={(e) => handleStartLocationChange('name', e.target.value)}
                    placeholder="e.g., Production Office"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.startLocation.address}
                    onChange={(e) => handleStartLocationChange('address', e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  value={formData.startLocation.time}
                  onChange={(e) => handleStartLocationChange('time', e.target.value)}
                />
              </div>
            </div>

            {/* End Location Section */}
            <div className="special-location-section">
              <h4>🏁 Ending Location</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Location Name</label>
                  <input
                    type="text"
                    value={formData.endLocation.name}
                    onChange={(e) => handleEndLocationChange('name', e.target.value)}
                    placeholder="e.g., Production Office, Hotel"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.endLocation.address}
                    onChange={(e) => handleEndLocationChange('address', e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Expected Arrival Time</label>
                <input
                  type="time"
                  value={formData.endLocation.time}
                  onChange={(e) => handleEndLocationChange('time', e.target.value)}
                />
              </div>
            </div>

            <div className="locations-section">
              <div className="locations-header">
                <h4>Locations</h4>
                <button type="button" onClick={addLocation} className="btn-secondary">
                  + Add Location
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.locations.map((_, index) => `location-${index}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {formData.locations.map((location, index) => (
                    <SortableLocationItem
                      key={`location-${index}`}
                      id={`location-${index}`}
                      index={index}
                      location={location}
                      updateLocation={updateLocation}
                      removeLocation={removeLocation}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Itinerary' : 'Create Itinerary'}
              </button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
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
                <div className="card-actions">
                  <button 
                    className="btn-share"
                    onClick={() => handleShare(itinerary)}
                    title="Share via email"
                  >
                    {itinerary.isShared ? '📧 Shared' : '📤 Share'}
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(itinerary)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDelete(itinerary._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="itinerary-date">
                {new Date(itinerary.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              {/* Start Location */}
              {itinerary.startLocation && (itinerary.startLocation.name || itinerary.startLocation.address) && (
                <div className="special-location start-location">
                  <div className="special-location-header">
                    <span className="location-icon">📍</span>
                    <strong>Start: {itinerary.startLocation.name || 'Production Office'}</strong>
                  </div>
                  <p className="location-address">{itinerary.startLocation.address}</p>
                  {itinerary.startLocation.time && (
                    <p className="location-time">Departure: {formatTime(itinerary.startLocation.time)}</p>
                  )}
                </div>
              )}

              <div className="itinerary-locations">
                <h4>{itinerary.locations.length} Location(s)</h4>
                {itinerary.locations.map((location, index) => (
                  <div key={index} className={`location-item status-${location.status || 'pending'}`}>
                    <div className="location-item-header">
                      <div className="location-main-info">
                        <strong>{location.setName}</strong>
                        <p>{location.address}</p>
                        {location.startTime && (
                          <p className="time-range">
                            {formatTime(location.startTime)} - {formatTime(location.endTime)}
                          </p>
                        )}
                      </div>
                      <div className="location-status-controls">
                        <button
                          className={`status-btn ${location.status === 'completed' ? 'active' : ''}`}
                          onClick={() => handleLocationStatus(itinerary._id, index, 'completed')}
                          title="Mark as completed"
                        >
                          ✓ Complete
                        </button>
                        <button
                          className={`status-btn ${location.status === 'skipped' ? 'active' : ''}`}
                          onClick={() => handleLocationStatus(itinerary._id, index, 'skipped')}
                          title="Mark as skipped"
                        >
                          ⊘ Skip
                        </button>
                        {location.status !== 'pending' && (
                          <button
                            className="status-btn reset"
                            onClick={() => handleLocationStatus(itinerary._id, index, 'pending')}
                            title="Reset to pending"
                          >
                            ↺ Reset
                          </button>
                        )}
                      </div>
                    </div>
                    {location.status && location.status !== 'pending' && (
                      <div className={`status-badge ${location.status}`}>
                        {location.status === 'completed' ? '✓ Completed' : '⊘ Skipped'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* End Location */}
              {itinerary.endLocation && (itinerary.endLocation.name || itinerary.endLocation.address) && (
                <div className="special-location end-location">
                  <div className="special-location-header">
                    <span className="location-icon">🏁</span>
                    <strong>End: {itinerary.endLocation.name || 'Return Location'}</strong>
                  </div>
                  <p className="location-address">{itinerary.endLocation.address}</p>
                  {itinerary.endLocation.time && (
                    <p className="location-time">Expected Arrival: {formatTime(itinerary.endLocation.time)}</p>
                  )}
                </div>
              )}

              <div className="itinerary-meta">
                <small>
                  Created: {new Date(itinerary.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && selectedItinerary && (
        <ShareModal 
          itinerary={selectedItinerary}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedItinerary(null);
          }}
          onShare={handleShareComplete}
        />
      )}
    </div>
  );
};

export default ItineraryManager;
