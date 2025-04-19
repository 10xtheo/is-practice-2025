import React, { FC, useState } from 'react';
import './Layout.scss';
import SideMenu from '../SideMenu/SideMenu';

interface LayoutProps {
  children: React.ReactNode;
}

interface ChildProps {
  onMenuToggle?: () => void;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`layout ${isMenuOpen ? 'layout--menu-open' : ''}`}>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="layout__content">
        {React.Children.map(children, child => {
          if (React.isValidElement<ChildProps>(child)) {
            return React.cloneElement(child, {
              onMenuToggle: handleMenuToggle
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export default Layout; 