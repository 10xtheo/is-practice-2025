import React, { FC, useState, useEffect } from 'react';
import { useActions, useTypedSelector } from '../../hooks';
import './Profile.scss';
import { IUser } from 'types/user';


interface ProfileProps {
  currentUser: IUser | undefined;
}

const Profile: FC<ProfileProps> = ({currentUser}) => {
  const [editedUser, setEditedUser] = useState<IUser | undefined>(currentUser);
  const { patchUser } = useActions();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    setEditedUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (editedUser && currentUser) {
      const hasChanges = 
        editedUser.full_name !== currentUser.full_name ||
        editedUser.email !== currentUser.email;
      setHasChanges(hasChanges);
    }
  }, [editedUser, currentUser]);

  const handleInputChange = (field: keyof IUser, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
      });
    }
  };

  const handleSave = async () => {
    if (editedUser && currentUser) {
      await patchUser({
        userData: {
          full_name: editedUser.full_name,
          email: editedUser.email
        }
      });
      setIsEditing(false);
      setHasChanges(false);
    }
  };

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
              {isEditing ? (
                <input
                  className="profile__input"
                  value={editedUser?.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                />
              ) : (
                <span className="profile__value">{currentUser?.full_name}</span>
              )}
            </div>
            <div className="profile__field">
              <span className="profile__label">Email:</span>
              {isEditing ? (
                <input
                  className="profile__input"
                  value={editedUser?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <span className="profile__value">{currentUser?.email}</span>
              )}
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
        <div className="profile__actions">
          {!isEditing ? (
            <>
              <button 
                className="profile__edit-button"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </button>
              <button 
                className="profile__logout-button"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/auth';
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <div className="profile__edit-actions">
              <button 
                className="profile__cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser(currentUser);
                  setHasChanges(false);
                }}
              >
                Отмена
              </button>
              <button 
                className={`profile__save-button ${!hasChanges ? 'profile__save-button--disabled' : ''}`}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                Сохранить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 