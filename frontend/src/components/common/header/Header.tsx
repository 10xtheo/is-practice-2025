import React, { FC, useState } from 'react';
import Select from '../select/Select';
import MenuIcon from '../../MenuIcon/MenuIcon';
import { IDirections, IModes, TDate } from 'types/date';
import cn from 'classnames';

import styles from './header.module.scss';

interface IHeaderProps {
  onClickArrow: (direction: IDirections) => void;
  displayedDate: string;
  onChangeOption: (option: IModes) => void;
  selectedOption: string;
  selectedDay: TDate;
  onMenuToggle: () => void;
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
  onMenuToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const changeToPrev = () => onClickArrow('left');
  const changeToNext = () => onClickArrow('right');
  const changeToToday = () => onClickArrow('today');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleModeChange = (value: string) => {
    onChangeOption(value as IModes);
  };
  
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
      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.search__input}
        />
        <i className={`fas fa-search ${styles.search__icon}`}></i>
      </div>
      <Select
        onChangeOption={handleModeChange}
        options={modes}
        selectedOption={selectedOption}
      />
    </header>
  );
};

export default Header;
