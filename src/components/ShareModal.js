import React, { useState } from 'react';
import PasswordGenerator from './PasswordGenerator';
import './ShareModal.css';

const ShareModal = ({ itinerary, onClose, onShare }) => {
  const [emails, setEmails] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Parse emails
    const emailList = emails
      .split(/[\s,;]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(', ')}`);
      setLoading(false);
      return;
    }

    if (emailList.length === 0) {
      setError('Please enter at least one email address');
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/itineraries/${itinerary._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          emails: emailList,
          password,
          message
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✓ Itinerary shared with ${emailList.length} recipient(s)!`);
        if (onShare) {
          onShare(data);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to share itinerary');
      }
    } catch (err) {
      setError('Error sharing itinerary: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    if (!window.confirm('Stop sharing this itinerary? Current recipients will no longer be able to access it.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/itineraries/${itinerary._id}/unshare`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✓ Itinerary is no longer shared');
        if (onShare) {
          onShare({ unshared: true });
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to unshare itinerary');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📧 Share Itinerary</h3>
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
            <div className="share-error">
              {error}
            </div>
          )}

          {success && (
            <div className="share-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Addresses *</label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas or spaces&#10;example@email.com, another@email.com"
                rows="3"
                required
                disabled={loading}
              />
              <small>Separate multiple emails with commas or spaces</small>
            </div>

            <div className="form-group">
              <label>Production Password *</label>
              <div className="password-field-with-generator">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  minLength="4"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn-show-generator"
                  onClick={() => setShowGenerator(!showGenerator)}
                >
                  {showGenerator ? '🔒 Hide Generator' : '🎲 Generate Password'}
                </button>
              </div>
              <small>Recipients will need this password to view the itinerary</small>
              
              {showGenerator && (
                <PasswordGenerator
                  onPasswordGenerated={(generatedPassword) => {
                    setPassword(generatedPassword);
                    setShowGenerator(false);
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label>Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to the email..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="share-info-box">
              <p><strong>🔐 Security Note:</strong></p>
              <ul>
                <li>Recipients will receive an email with a secure link</li>
                <li>They must enter the production password to view</li>
                <li>Share the password separately (call, text, etc.)</li>
                <li>You can stop sharing at any time</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : '📤 Share Itinerary'}
              </button>
              
              {itinerary.isShared && (
                <button 
                  type="button"
                  onClick={handleUnshare}
                  className="btn-secondary"
                  disabled={loading}
                >
                  🔒 Stop Sharing
                </button>
              )}
              
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>

          {itinerary.isShared && itinerary.sharedWith && itinerary.sharedWith.length > 0 && (
            <div className="shared-with-section">
              <h5>Currently shared with:</h5>
              <div className="shared-emails">
                {itinerary.sharedWith.map((email, index) => (
                  <span key={index} className="email-badge">{email}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
