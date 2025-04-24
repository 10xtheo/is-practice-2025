import React, { FC, useEffect, useState } from 'react';
import { IUser } from 'types/user';
import styles from './styles.module.css';
import { useTypedSelector } from 'hooks/useTypedSelector';

interface IUserMultiSelectorProps {
  onChange: (users: IUser[]) => void;
  placeholder?: string;
  className?: string;
}

const UserMultiSelector: FC<IUserMultiSelectorProps> = ({
  onChange,
  placeholder = 'Выберите участников...',
  className = ''
}) => {
  const { users } = useTypedSelector(({ users }) => users);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // @TODO прокидывать текущего юзера
  
  const selectedUsers = window["selectedUsers"] || []
  
  const handleUserToggle = (user: IUser) => {
    const isSelected = selectedUsers.some(selectedUser => selectedUser.id === user.id);

    if (isSelected) {
        window["selectedUsers"] = selectedUsers.filter(selectedUser => selectedUser.id !== user.id);
    } else {
        window["selectedUsers"] = [...selectedUsers, user];
    }

    onChange(window["selectedUsers"]);
  };

  const isUserSelected = (user: IUser) => {
    return selectedUsers.some(selectedUser => selectedUser.id === user.id);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div 
        className={styles.selector}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedUsers.length > 0 ? (
          <div className={styles.selectedUsers}>
            {selectedUsers.map(user => (
              <span key={user.id} className={styles.selectedUser}>
                {user.full_name}
              </span>
            ))}
          </div>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.userList}>
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={`${styles.userItem} ${isUserSelected(user) ? styles.selected : ''}`}
                onClick={() => handleUserToggle(user)}
              >
                <span className={styles.userName}>{user.full_name}</span>
                {isUserSelected(user) && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMultiSelector; 