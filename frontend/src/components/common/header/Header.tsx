import React, { FC, useState, useRef, useEffect } from 'react';
import Select from '../select/Select';
import MenuIcon from '../../MenuIcon/MenuIcon';
import { IDirections, IModes, TDate } from 'types/date';
import cn from 'classnames';
import SearchDropdown from './SearchDropdown';
import { useDebounce } from '../../../hooks/useDebounce';
import { useModal } from '../../../hooks/useModal';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import axios from 'axios';
import styles from './header.module.scss';

interface IHeaderProps {
  onClickArrow: (direction: IDirections) => void;
  displayedDate: string;
  onChangeOption: (option: IModes) => void;
  selectedOption: string;
  selectedDay: TDate;
  onMenuToggle: () => void;
  onProfileClick: () => void;
}

interface SearchResult {
  users: Array<any>;
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

const modes = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' }
];

const Header: FC<IHeaderProps> = ({
  onClickArrow,
  displayedDate,
  onChangeOption,
  selectedOption,
  selectedDay,
  onMenuToggle,
  onProfileClick
}) => {
  const { openModalEdit, openModalEditCalendar } = useModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ users: [], events: [], categories: [] });
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { events } = useTypedSelector(({ events }) => events);
  const { calendars } = useTypedSelector(({ calendars }) => calendars);
  

  const changeToPrev = () => onClickArrow('left');
  const changeToNext = () => onClickArrow('right');
  const changeToToday = () => onClickArrow('today');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownVisible(true);    
  };

  const handleModeChange = (value: string) => {
    onChangeOption(value as IModes);
  };

  const handleEventClick = (eventId: string) => {
    const eventData = events.find(event => event.id === eventId);
    if (eventData) {
      openModalEdit({ eventData, eventId });
    }
    // setIsDropdownVisible(false);
  };

  const handleCategoryClick = (calendarId: string) => {
    const calendarData = calendars.find(cal => cal.id === calendarId);
    if (calendarData) {
      openModalEditCalendar({ calendarData, calendarId });
    }
    // setIsDropdownVisible(false);
  };

  const handleUserClick = (userId: string) => {
    // setIsDropdownVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {      
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        // setIsDropdownVisible(false);        
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchQuery.trim()) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const headers: HeadersInit = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };

          const response = await axios.get(`http://localhost:8000/api/v1/basic-search?q=${encodeURIComponent(debouncedSearchQuery)}`, {
            headers: headers
          });          
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error fetching search results:', error);
          setSearchResults({ users: [], events: [], categories: [] });
        }
      } else {        
        setSearchResults({ users: [], events: [], categories: [] });
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);
  
  return (
    <header className={styles.header}>
      <MenuIcon onMenuToggle={onMenuToggle} />
      <div className={styles.navigation}>
        <button
          className={cn(styles.navigation__today__btn, "button")}
          onClick={changeToToday}
        >
          Сегодня</button>
        <div className={styles.navigation__body}>
          <div className={styles.navigation__icons}>
            <button
              className={cn("icon-button", styles.navigation__icon)}
              onClick={changeToPrev}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className={cn("icon-button", styles.navigation__icon)}
              onClick={changeToNext}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <span className={styles.navigation__date}>{displayedDate}</span>
        </div>
      </div>
      <div className={styles.search} ref={searchContainerRef}>
        <input
          type="text"
          placeholder="Что/кого ищем?"
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.search__input}
        />
        <i className={`fas fa-search ${styles.search__icon}`}></i>
        {isDropdownVisible && (
          <SearchDropdown
            results={searchResults}
            onEventClick={handleEventClick}
            onCategoryClick={handleCategoryClick}
            onUserClick={handleUserClick}
          />
        )}
      </div>
      <Select
        onChangeOption={handleModeChange}
        options={modes}
        selectedOption={selectedOption}
      />
      <button
        style={{ border: '1px solid gray' }}
        className={cn("icon-button", styles.navigation__icon)}
        onClick={onProfileClick}
      >
        <i className="fas fa-user"></i>
      </button>
    </header>
  );
};

export default Header;
