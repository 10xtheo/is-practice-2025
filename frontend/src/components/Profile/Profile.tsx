import React, { FC } from 'react';
import './Profile.scss';

interface ProfileProps {
}

const Profile: FC<ProfileProps> = () => {
  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__header">
          <button className="profile__back-button" onClick={() => {window.location.href = '/'}}>
            ← Back to Calendar
          </button>
          <h1 className="profile__title">Profile</h1>
        </div>
        <div className="profile__content">
          <div className="profile__avatar">
            <div className="profile__avatar-placeholder">
              <span className="profile__avatar-text">JD</span>
            </div>
          </div>
          <div className="profile__info">
            <div className="profile__field">
              <span className="profile__label">Name:</span>
              <span className="profile__value">John Doe</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Email:</span>
              <span className="profile__value">john.doe@example.com</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Role:</span>
              <span className="profile__value">User</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 