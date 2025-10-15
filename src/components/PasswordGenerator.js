import React, { useState } from 'react';
import './PasswordGenerator.css';

const PasswordGenerator = ({ onPasswordGenerated }) => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let characters = '';
    let newPassword = '';

    // Build character set based on selected options
    if (options.uppercase) characters += uppercase;
    if (options.lowercase) characters += lowercase;
    if (options.numbers) characters += numbers;
    if (options.symbols) characters += symbols;

    // If no options selected, default to lowercase
    if (characters.length === 0) {
      characters = lowercase;
    }

    // Ensure at least one character from each selected type
    if (options.uppercase) newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    if (options.lowercase) newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    if (options.numbers) newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    if (options.symbols) newPassword += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest of the password
    for (let i = newPassword.length; i < length; i++) {
      newPassword += characters[Math.floor(Math.random() * characters.length)];
    }

    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(newPassword);
    setCopied(false);

    // Call the callback if provided
    if (onPasswordGenerated) {
      onPasswordGenerated(newPassword);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const getPasswordStrength = () => {
    if (!password) return { text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { text: 'Weak', color: '#ef4444' };
    if (strength <= 4) return { text: 'Medium', color: '#f59e0b' };
    return { text: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="password-generator">
      <div className="password-display">
        <input
          type="text"
          value={password}
          readOnly
          placeholder="Click generate to create a password"
          className="password-input"
        />
        {password && (
          <button
            onClick={copyToClipboard}
            className="btn-copy"
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        )}
      </div>

      {password && (
        <div className="password-strength">
          <span>Strength: </span>
          <span style={{ color: strength.color, fontWeight: 'bold' }}>
            {strength.text}
          </span>
        </div>
      )}

      <div className="password-options">
        <div className="option-group">
          <label>Password Length: {length}</label>
          <input
            type="range"
            min="4"
            max="32"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="length-slider"
          />
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={() => handleOptionChange('uppercase')}
            />
            <span>Uppercase (A-Z)</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={() => handleOptionChange('lowercase')}
            />
            <span>Lowercase (a-z)</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={() => handleOptionChange('numbers')}
            />
            <span>Numbers (0-9)</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={() => handleOptionChange('symbols')}
            />
            <span>Symbols (!@#$...)</span>
          </label>
        </div>
      </div>

      <button
        onClick={generatePassword}
        className="btn-generate"
      >
        🎲 Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
