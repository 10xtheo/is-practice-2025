import React, { FC, useState } from 'react';
import './MenuIcon.scss';
import SideMenu from '../SideMenu/SideMenu';

interface MenuIconProps {
  onClick?: () => void;
}

const MenuIcon: FC<MenuIconProps> = ({ onClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onClick) onClick();
  };

  return (
    <>
      <button className="menu-icon" onClick={handleClick} aria-label="Menu">
        <span className="menu-icon__line"></span>
        <span className="menu-icon__line"></span>
        <span className="menu-icon__line"></span>
      </button>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default MenuIcon; 