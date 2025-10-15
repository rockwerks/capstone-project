import React, { useState } from 'react';
import './TravelTimeCalculator.css';

const TravelTimeCalculator = ({ itinerary, onClose }) => {
  const [calculating, setCalculating] = useState(false);
  const [travelTimes, setTravelTimes] = useState([]);
  const [error, setError] = useState('');
  const [totalTime, setTotalTime] = useState(null);

  const calculateTimes = async () => {
    setError('');
    setCalculating(true);

    try {
      // Build list of all locations in order
      const allLocations = [];
      
      // Add start location if exists
      if (itinerary.startLocation && itinerary.startLocation.address) {
        allLocations.push({
          name: itinerary.startLocation.name || 'Start Location',
          address: itinerary.startLocation.address
        });
      }

      // Add all main locations
      itinerary.locations.forEach(loc => {
        allLocations.push({
          name: loc.setName,
          address: loc.address
        });
      });

      // Add end location if exists
      if (itinerary.endLocation && itinerary.endLocation.address) {
        allLocations.push({
          name: itinerary.endLocation.name || 'End Location',
          address: itinerary.endLocation.address
        });
      }

      if (allLocations.length < 2) {
        setError('Need at least 2 locations with addresses to calculate travel times');
        setCalculating(false);
        return;
      }

      // Calculate travel times between consecutive locations
      const times = [];
      let totalDuration = 0;
      let totalDistance = 0;

      for (let i = 0; i < allLocations.length - 1; i++) {
        const origin = allLocations[i].address;
        const destination = allLocations[i + 1].address;

        const response = await fetch('/api/calculate-travel-times', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            origins: [origin],
            destinations: [destination],
            mode: 'driving'
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to calculate travel time');
        }

        const element = data.data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          const duration = element.duration.value; // in seconds
          const distance = element.distance.value; // in meters
          
          times.push({
            from: allLocations[i].name,
            to: allLocations[i + 1].name,
            duration: element.duration.text,
            distance: element.distance.text,
            durationSeconds: duration,
            distanceMeters: distance
          });

          totalDuration += duration;
          totalDistance += distance;
        } else {
          times.push({
            from: allLocations[i].name,
            to: allLocations[i + 1].name,
            error: `Unable to calculate (${element.status})`
          });
        }
      }

      setTravelTimes(times);
      setTotalTime({
        duration: formatDuration(totalDuration),
        distance: formatDistance(totalDistance),
        durationSeconds: totalDuration,
        distanceMeters: totalDistance
      });

    } catch (err) {
      setError('Error calculating travel times: ' + err.message);
    } finally {
      setCalculating(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const formatDistance = (meters) => {
    const kilometers = (meters / 1000).toFixed(1);
    return `${kilometers} km`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content travel-time-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚗 Calculate Driving Times</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="itinerary-preview">
            <h4>{itinerary.title}</h4>
            <p>
              {new Date(itinerary.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {error && (
            <div className="travel-error">
              {error}
            </div>
          )}

          {travelTimes.length === 0 ? (
            <div className="calculate-prompt">
              <p>Click the button below to calculate estimated driving times and distances between all locations in this itinerary.</p>
              <button 
                className="btn-primary btn-calculate"
                onClick={calculateTimes}
                disabled={calculating}
              >
                {calculating ? '⏳ Calculating...' : '� Calculate Driving Times'}
              </button>
            </div>
          ) : (
            <div className="travel-results">
              <h4>Driving Times & Distances</h4>
              
              <div className="travel-segments">
                {travelTimes.map((segment, index) => (
                  <div key={index} className="travel-segment">
                    {segment.error ? (
                      <>
                        <div className="segment-route">
                          <span className="location-name">{segment.from}</span>
                          <span className="arrow">→</span>
                          <span className="location-name">{segment.to}</span>
                        </div>
                        <div className="segment-error">{segment.error}</div>
                      </>
                    ) : (
                      <>
                        <div className="segment-route">
                          <span className="location-name">{segment.from}</span>
                          <span className="arrow">→</span>
                          <span className="location-name">{segment.to}</span>
                        </div>
                        <div className="segment-info">
                          <span className="duration">⏱️ {segment.duration}</span>
                          <span className="distance">📏 {segment.distance}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {totalTime && (
                <div className="total-summary">
                  <h5>Total Travel Time</h5>
                  <div className="total-stats">
                    <div className="stat">
                      <span className="stat-label">Duration</span>
                      <span className="stat-value">⏱️ {totalTime.duration}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Distance</span>
                      <span className="stat-value">📏 {totalTime.distance}</span>
                    </div>
                  </div>
                  <p className="note">
                    * Travel times are estimates based on typical traffic conditions. 
                    Actual times may vary based on time of day, weather, and road conditions.
                  </p>
                </div>
              )}

              <button 
                className="btn-secondary btn-recalculate"
                onClick={calculateTimes}
                disabled={calculating}
              >
                🔄 Recalculate
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelTimeCalculator;
