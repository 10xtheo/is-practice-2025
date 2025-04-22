import React, { FC } from 'react';
import './MenuIcon.scss';

interface MenuIconProps {
  onMenuToggle: () => void;
}

const MenuIcon: FC<MenuIconProps> = ({ onMenuToggle }) => {
  return (
    <button className="menu-icon" onClick={onMenuToggle} aria-label="Menu">
      <span className="menu-icon__line"></span>
      <span className="menu-icon__line"></span>
      <span className="menu-icon__line"></span>
    </button>
  );
};

export default MenuIcon; 