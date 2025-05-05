import React from 'react';
import styles from './search-dropdown.module.scss';
import { IUser } from 'types/user';

interface SearchResult {
  users: Array<IUser>;
  events: Array<{
    title: string;
    description: string;
    start: string;
    end: string;
    type: string;
    id: string;
  }>;
  categories: Array<{
    title: string;
    id: string;
  }>;
}

interface SearchDropdownProps {
  results: SearchResult;
  onEventClick: (eventId: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onUserClick: (userId: string) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  results,
  onEventClick,
  onCategoryClick,
  onUserClick,
}) => {
  const hasResults = results.events.length > 0 || results.categories.length > 0;

  if (!hasResults) {
    return null;
  }

  return (
    <div className={styles.dropdown}>
      {results.events.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>События</div>
          {results.events.map((event) => (
            <div
              key={event.id}
              className={styles.item}
              onClick={() => onEventClick(event.id)}
            >
              <div className={styles.itemTitle}>{event.title}</div>
              <div className={styles.itemDescription}>{event.description}</div>
              <div className={styles.itemTime}>
                {new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.categories.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Категории</div>
          {results.categories.map((category) => (
            <div
              key={category.id}
              className={styles.item}
              onClick={() => onCategoryClick(category.id)}
            >
              <div className={styles.itemTitle}>{category.title}</div>
            </div>
          ))}
        </div>
      )}

      {results.users.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Пользователи</div>
          {results.users.map((user) => (
            <div
              key={user.id}
              className={styles.item}
              onClick={() => onUserClick(user.id)}
            >
              <div className={styles.itemTitle}>{user.full_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown; 