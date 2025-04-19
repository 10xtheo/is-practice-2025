import React, { FC } from 'react';
import './SideMenu.scss';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: FC<SideMenuProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`side-menu ${isOpen ? 'side-menu--open' : ''}`}>
      <div className="side-menu__content">
        {/* Add your menu items here */}
        <button className="side-menu__close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default SideMenu; 