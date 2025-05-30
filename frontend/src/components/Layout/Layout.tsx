import React, { FC, useState } from 'react';
import './Layout.scss';
import SideMenu from '../SideMenu/SideMenu';
import { useActions } from 'hooks/useActions';

interface LayoutProps {
	children: React.ReactNode;
	isAuth?: boolean;
}

interface ChildProps {
	onMenuToggle?: () => void;
}

const Layout: FC<LayoutProps> = ({ children, isAuth = false }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(true);
	const { setSelectedCalendars } = useActions();

	const handleMenuToggle = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleSelectedCalendarsChange = (selectedIds: string[]) => {
		setSelectedCalendars(selectedIds);
	};
	const isAuthPage = window.location.pathname === '/auth';
	const isProfilePage = window.location.pathname === '/profile';

	return (
		<div className={`layout ${isAuth && isMenuOpen && !isAuthPage && !isProfilePage ? 'layout--menu-open' : ''}`}>
			<SideMenu
				isOpen={isAuth && isMenuOpen && !isAuthPage && !isProfilePage}
				onClose={() => setIsMenuOpen(false)}
				onSelectedCalendarsChange={handleSelectedCalendarsChange}
			/>
			<div className="layout__content">
				{React.Children.map(children, (child) => {
					if (React.isValidElement<ChildProps>(child)) {
						return React.cloneElement(child, {
							onMenuToggle: handleMenuToggle,
						});
					}
					return child;
				})}
			</div>
		</div>
	);
};

export default Layout;
