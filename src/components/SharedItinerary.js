import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './SharedItinerary.css';

const SharedItinerary = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [travelTimes, setTravelTimes] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/shared/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        setItinerary(data.itinerary);
        setAuthenticated(true);
        // Automatically calculate travel times after loading itinerary
        calculateTravelTimes(data.itinerary);
      } else {
        setError(data.error || 'Failed to access itinerary');
      }
    } catch (err) {
      setError('Error accessing itinerary: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTravelTimes = async (itineraryData) => {
    try {
      // Build list of all locations in order
      const allLocations = [];
      
      // Add start location if exists
      if (itineraryData.startLocation && itineraryData.startLocation.address) {
        allLocations.push({
          name: itineraryData.startLocation.name || 'Start Location',
          address: itineraryData.startLocation.address
        });
      }

      // Add all main locations
      itineraryData.locations.forEach(loc => {
        allLocations.push({
          name: loc.setName,
          address: loc.address
        });
      });

      // Add end location if exists
      if (itineraryData.endLocation && itineraryData.endLocation.address) {
        allLocations.push({
          name: itineraryData.endLocation.name || 'End Location',
          address: itineraryData.endLocation.address
        });
      }

      if (allLocations.length < 2) {
        return;
      }

      // Calculate travel times between consecutive locations
      const times = [];

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

        if (data.success) {
          const element = data.data.rows[0].elements[0];
          
          if (element.status === 'OK') {
            times.push({
              fromIndex: i,
              toIndex: i + 1,
              duration: element.duration.text,
              distance: element.distance.text
            });
          }
        }
      }

      setTravelTimes(times);

    } catch (err) {
      console.error('Error calculating travel times:', err);
    }
  };

  const getTravelTimeForSegment = (fromIndex, toIndex) => {
    return travelTimes.find(t => t.fromIndex === fromIndex && t.toIndex === toIndex);
  };

  if (!authenticated) {
    return (
      <div className="shared-itinerary-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>🔐 Secure Itinerary Access</h2>
              <p>This itinerary is password protected</p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Production Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password provided to you"
                  required
                  disabled={loading}
                  autoFocus
                />
                <small>Ask the person who shared this with you for the password</small>
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Verifying...' : '🔓 Access Itinerary'}
              </button>
            </form>

            <div className="auth-info">
              <p>
                <strong>Why is this protected?</strong><br/>
                Production schedules contain sensitive information. 
                The password ensures only authorized personnel can view this itinerary.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-itinerary-page">
      <div className="shared-container">
        <div className="shared-header">
          <div className="shared-badge">📧 Shared Itinerary</div>
          <h1>{itinerary.title}</h1>
          <p className="shared-date">
            {new Date(itinerary.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {itinerary.sharedBy && (
            <p className="shared-by">
              Shared by: <strong>{itinerary.sharedBy.name}</strong> ({itinerary.sharedBy.email})
            </p>
          )}
        </div>

        <div className="shared-content">
          {/* Start Location */}
          {itinerary.startLocation && itinerary.startLocation.name && (
            <div className="shared-special-location start-location">
              <div className="location-icon-header">
                <span className="location-icon">📍</span>
                <h3>Starting Location</h3>
              </div>
              <div className="location-details">
                <p className="location-name">{itinerary.startLocation.name}</p>
                {itinerary.startLocation.address && (
                  <p className="location-address">📮 {itinerary.startLocation.address}</p>
                )}
                {itinerary.startLocation.time && (
                  <p className="location-time">⏰ Departure: {itinerary.startLocation.time}</p>
                )}
              </div>
            </div>
          )}

          {/* Travel time from start to first location */}
          {itinerary.startLocation && itinerary.startLocation.address && itinerary.locations.length > 0 && (
            <>
              {getTravelTimeForSegment(0, 1) && (
                <div className="travel-segment-display">
                  <div className="travel-arrow">↓</div>
                  <div className="travel-info">
                    <span className="travel-duration">🚗 {getTravelTimeForSegment(0, 1).duration}</span>
                    <span className="travel-distance">📏 {getTravelTimeForSegment(0, 1).distance}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Main Locations */}
          <div className="shared-locations-section">
            <h3>📌 Filming Locations ({itinerary.locations.length})</h3>
            {itinerary.locations.map((location, index) => {
              // Calculate the actual segment index (accounting for start location)
              const hasStartLocation = itinerary.startLocation && itinerary.startLocation.address;
              const segmentIndexBefore = hasStartLocation ? index + 1 : index;
              const segmentIndexAfter = segmentIndexBefore + 1;
              
              return (
                <React.Fragment key={index}>
                  <div className="shared-location-card">
                    <div className="location-number">{index + 1}</div>
                    <div className="location-info">
                      <h4>{location.setName}</h4>
                      <p className="address">📍 {location.address}</p>
                      
                      {(location.startTime || location.endTime) && (
                        <p className="time-range">
                          ⏰ {location.startTime} - {location.endTime}
                        </p>
                      )}

                      {location.contactName && (
                        <p className="contact">
                          👤 {location.contactName}
                          {location.contactPhone && ` • 📞 ${location.contactPhone}`}
                        </p>
                      )}

                      {location.notes && (
                        <div className="location-notes">
                          <strong>Notes:</strong>
                          <p>{location.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Travel time to next location */}
                  {index < itinerary.locations.length - 1 && getTravelTimeForSegment(segmentIndexBefore, segmentIndexAfter) && (
                    <div className="travel-segment-display">
                      <div className="travel-arrow">↓</div>
                      <div className="travel-info">
                        <span className="travel-duration">🚗 {getTravelTimeForSegment(segmentIndexBefore, segmentIndexAfter).duration}</span>
                        <span className="travel-distance">📏 {getTravelTimeForSegment(segmentIndexBefore, segmentIndexAfter).distance}</span>
                      </div>
                    </div>
                  )}

                  {/* Travel time to end location (if it's the last location and there's an end location) */}
                  {index === itinerary.locations.length - 1 && 
                   itinerary.endLocation && 
                   itinerary.endLocation.address && 
                   getTravelTimeForSegment(segmentIndexAfter, segmentIndexAfter + 1) && (
                    <div className="travel-segment-display">
                      <div className="travel-arrow">↓</div>
                      <div className="travel-info">
                        <span className="travel-duration">🚗 {getTravelTimeForSegment(segmentIndexAfter, segmentIndexAfter + 1).duration}</span>
                        <span className="travel-distance">📏 {getTravelTimeForSegment(segmentIndexAfter, segmentIndexAfter + 1).distance}</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* End Location */}
          {itinerary.endLocation && itinerary.endLocation.name && (
            <div className="shared-special-location end-location">
              <div className="location-icon-header">
                <span className="location-icon">🏁</span>
                <h3>Ending Location</h3>
              </div>
              <div className="location-details">
                <p className="location-name">{itinerary.endLocation.name}</p>
                {itinerary.endLocation.address && (
                  <p className="location-address">📮 {itinerary.endLocation.address}</p>
                )}
                {itinerary.endLocation.time && (
                  <p className="location-time">⏰ Expected Arrival: {itinerary.endLocation.time}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="shared-footer">
          <div className="print-button-container">
            <button 
              onClick={() => window.print()}
              className="btn-secondary"
            >
              🖨️ Print Itinerary
            </button>
          </div>
          <p className="confidential-notice">
            ⚠️ <strong>Confidential:</strong> This production schedule is for authorized personnel only. 
            Do not share or distribute without permission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;
