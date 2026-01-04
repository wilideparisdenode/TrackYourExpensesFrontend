import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, setFontSize, toggleCompactMode } from "../services/modeSlice";
import {
  setCurrency,
  setLanguage,
  setDateFormat,
  toggleNotifications
} from "../services/preferenceSlice";
import "./settings.css";
import { apiService } from "../services/api";
import {
  Gear,
  Person,
  KeyFill,
  Palette,
  Eye,
  EyeSlash,
  X,
  Camera
} from "react-bootstrap-icons";

export default function Settings() {
  const [activeModal, setActiveModal] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get state from Redux store
  const modeState = useSelector((state) => state.mode);
  const preferencesState = useSelector((state) => state.preferences);
  const dispatch = useDispatch();

const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    file: null,
    profilePicturePreview: null
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Initialize local state with Redux state using useEffect
  const [preferences, setPreferences] = useState({
    currency: "USD",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    notifications: true
  });

  const [themeSettings, setThemeSettings] = useState({
    theme: "dark",
    fontSize: "medium",
    compactMode: false
  });

  // Sync local state with Redux state
  useEffect(() => {
    if (preferencesState) {
      setPreferences({
        currency: preferencesState.currency || "USD",
        language: preferencesState.language || "en",
        dateFormat: preferencesState.dateFormat || "MM/DD/YYYY",
        notifications: preferencesState.notifications !== undefined ? preferencesState.notifications : true
      });
    }
  }, [preferencesState]);

  useEffect(() => {
    if (modeState) {
      setThemeSettings({
        theme: modeState.theme || "dark",
        fontSize: modeState.fontSize || "medium",
        compactMode: modeState.compactMode || false
      });
    }
  }, [modeState]);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    // Reset form states when closing modal
    setPasswordInfo({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(); // Fixed variable name from formD to formData
    
    try {
      formData.append("name", personalInfo.name);
      formData.append("email", personalInfo.email);
      
      // Only append file if it exists and is a new file
      if (personalInfo.file && personalInfo.file instanceof File) {
        formData.append("file", personalInfo.file);
      }

      const result = await apiService.changeinfo(formData);
      console.log("Update result:", result);
      
      if (result) {
        alert("Personal information has been updated");
        closeModal();
        
        // Reset file after successful upload
        setPersonalInfo(prev => ({
          ...prev,
          file: null,
          profilePicturePreview: null
        }));
      }
    } catch (error) {
      console.error("Error updating personal info:", error);
      alert("Failed to update personal information");
    }
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (passwordInfo.newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }

    try {
      const result = await apiService.changePass({
        oldPassword: passwordInfo.currentPassword,
        newPassword: passwordInfo.newPassword
      });
      
      if (result) {
        alert("Password has been changed successfully");
        closeModal();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    }
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    // All preferences are already updated via individual handlers
    console.log("Preferences updated:", preferences);
    closeModal();
  };

  const handleThemeSubmit = (e) => {
    e.preventDefault();
    // All theme settings are already updated via individual handlers
    console.log("Theme settings updated:", themeSettings);
    closeModal();
  };

 const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    
    // Reset file input if no file selected
    if (!file) {
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      e.target.value = ''; // Clear the invalid file
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      e.target.value = ''; // Clear the oversized file
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    
    // Update state with file object and preview URL
    setPersonalInfo((prev) => ({
      ...prev,
      file: file,
      profilePicturePreview: imageUrl
    }));
  };


  // Handle removing profile picture
  const handleRemoveProfilePicture = () => {
    setPersonalInfo((prev) => ({
      ...prev,
      profilePicture: null
    }));
  };

  // Handle individual preference changes and dispatch immediately
  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Dispatch individual actions for immediate updates
    switch (key) {
      case 'currency':
        dispatch(setCurrency(value));
        break;
      case 'language':
        dispatch(setLanguage(value));
        break;
      case 'dateFormat':
        dispatch(setDateFormat(value));
        break;
      case 'notifications':
        if (value !== preferences.notifications) {
          dispatch(toggleNotifications());
        }
        break;
      default:
        break;
    }
  };

  // Handle individual theme changes and dispatch immediately
  const handleThemeChange = (key, value) => {
    const newThemeSettings = { ...themeSettings, [key]: value };
    setThemeSettings(newThemeSettings);
    
    // Dispatch individual actions for immediate updates
    switch (key) {
      case 'theme':
        dispatch(setTheme(value));
        break;
      case 'fontSize':
        dispatch(setFontSize(value));
        break;
      case 'compactMode':
        if (value !== themeSettings.compactMode) {
          dispatch(toggleCompactMode());
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="settings">
      {/* Personal Information Box */}
      <div className="box personal-info" onClick={() => openModal('personal')}>
        <div className="logo">
          <Person />
        </div>
        <p className="infor">Change your personal info</p>
      </div>

      {/* Change Password Box */}
      <div className="box change-password" onClick={() => openModal('password')}>
        <div className="logo">
          <KeyFill />
        </div>
        <p className="infor">Change your password</p>
      </div>

      {/* Preferences Box */}
      <div className="box preferences" onClick={() => openModal('preferences')}>
        <div className="logo">
          <Palette />
        </div>
        <p className="infor">App preferences</p>
      </div>

      {/* Theme & Mode Box */}
      <div className="box mode" onClick={() => openModal('theme')}>
        <div className="logo">
          <Gear />
        </div>
        <p className="infor">Theme & mode settings</p>
      </div>

       {/* Personal Information Modal - CORRECTED */}
      {activeModal === 'personal' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content personal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Personal Information</h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePersonalInfoSubmit}>
              {/* Profile Picture Section - CORRECTED */}
              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  <div className="profile-picture">
                    {personalInfo.profilePicturePreview ? (
                      <img 
                        src={personalInfo.profilePicturePreview} 
                        alt="Profile" 
                        className="profile-image"
                      />
                    ) : (
                      <div className="profile-placeholder">
                        <Person size={32} />
                      </div>
                    )}
                    <div className="profile-overlay">
                      <label htmlFor="profile-upload" className="upload-label">
                        <Camera size={20} />
                        <span>Change Photo</span>
                      </label>
                      <input
                        type="file"
                        id="profile-upload"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="file-input"
                      />
                    </div>
                  </div>
                </div>
                {personalInfo.profilePicturePreview && (
                  <button 
                    type="button" 
                    className="btn-remove-photo"
                    onClick={handleRemoveProfilePicture}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {activeModal === 'password' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input-container">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    value={passwordInfo.currentPassword}
                    onChange={(e) => setPasswordInfo({...passwordInfo, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-container">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={passwordInfo.newPassword}
                    onChange={(e) => setPasswordInfo({...passwordInfo, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={passwordInfo.confirmPassword}
                    onChange={(e) => setPasswordInfo({...passwordInfo, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {activeModal === 'preferences' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>App Preferences</h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePreferencesSubmit}>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CFA">CFA (CFA)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dateFormat">Date Format</label>
                <select
                  id="dateFormat"
                  value={preferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Enable notifications
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Theme Settings Modal */}
      {activeModal === 'theme' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Theme & Display Settings</h2>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleThemeSubmit}>
              <div className="form-group">
                <label htmlFor="theme">Theme</label>
                <select
                  id="theme"
                  value={themeSettings.theme}
                  onChange={(e) => handleThemeChange('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fontSize">Font Size</label>
                <select
                  id="fontSize"
                  value={themeSettings.fontSize}
                  onChange={(e) => handleThemeChange('fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="x-large">Extra Large</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={themeSettings.compactMode}
                    onChange={(e) => handleThemeChange('compactMode', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Compact mode
                </label>
              </div>
              <div className="current-settings">
                <h4>Current Settings:</h4>
                <p>Theme: {modeState.theme}</p>
                <p>Font Size: {modeState.fontSize}</p>
                <p>Compact Mode: {modeState.compactMode ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}