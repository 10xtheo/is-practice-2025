import React, { FC } from 'react';
import './Profile.scss';
import { IUser } from 'types/user';

interface ProfileProps {
  currentUser: IUser | undefined;
}

const Profile: FC<ProfileProps> = ({currentUser}) => {
  let userInitials = currentUser?.full_name.split(' ')[0][0]
  if (currentUser?.full_name.split(' ').length > 1) {
    userInitials += currentUser?.full_name.split(' ')[1][0]
  }

  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__header">
          <button className="profile__back-button" onClick={() => {window.location.href = '/'}}>
            ← В календарь
          </button>
          <h1 className="profile__title">Profile</h1>
        </div>
        <div className="profile__content">
          <div className="profile__avatar">
            <div className="profile__avatar-placeholder">
              <span className="profile__avatar-text">{userInitials}</span>
            </div>
          </div>
          <div className="profile__info">
            <div className="profile__field">
              <span className="profile__label">ФИО:</span>
              <span className="profile__value">{currentUser?.full_name}</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Email:</span>
              <span className="profile__value">{currentUser?.email}</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Отдел:</span>
              <span className="profile__value">{currentUser?.department}</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Должность:</span>
              <span className="profile__value">{currentUser?.position}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 