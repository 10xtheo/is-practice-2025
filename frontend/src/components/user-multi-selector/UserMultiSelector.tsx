import React, { FC, useEffect, useState } from 'react';
import { IUser } from 'types/user';
import styles from './styles.module.css';
import { useTypedSelector } from 'hooks/useTypedSelector';

interface IUserMultiSelectorProps {
	onChange: (users: IUser[]) => void;
	placeholder?: string;
	className?: string;
	storageName?: string;
	defaultSelectedUsers?: string[];
}

const UserMultiSelector: FC<IUserMultiSelectorProps> = ({
	onChange,
	placeholder = 'Выберите участников...',
	className = '',
	storageName = 'selectedUsers',
	defaultSelectedUsers = [],
}) => {
	const { users, user } = useTypedSelector(({ users }) => users);
	const currentUser = user;
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	// Скрываем текущего юзера из селектора
	// users = users.filter((u) => u.id !== user.id)

	// Локальное состояние для выбранных пользователей
	const [selectedUsers, setSelectedUsers] = useState<IUser[]>(() => {
		// Инициализация из window или defaultSelectedUsers
		if (window[storageName] && window[storageName].length > 0) {
			return window[storageName];
		}
		if (defaultSelectedUsers.length > 0 && users.length > 0) {
			const initial = users.filter((user) => defaultSelectedUsers.includes(user.id));
			window[storageName] = initial;
			return initial;
		}
		return [];
	});

	// При изменении users или defaultSelectedUsers синхронизируем состояние
	useEffect(() => {
		if ((!window[storageName] || window[storageName].length === 0) && defaultSelectedUsers.length > 0) {
			const initial = users.filter((user) => defaultSelectedUsers.includes(user.id));
			window[storageName] = initial;
			setSelectedUsers(initial);
		}
	}, [users, defaultSelectedUsers]);

	const filteredUsers = users.filter((user) => user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

	const handleUserToggle = (user: IUser) => {
		setSelectedUsers((prev) => {
			const isSelected = prev.some((u) => u.id === user.id);
			const newSelected = isSelected ? prev.filter((u) => u.id !== user.id) : [...prev, user];

			// Синхронизируем с window
			window[storageName] = newSelected;

			onChange(newSelected);
			return newSelected;
		});
	};

	const isUserSelected = (user: IUser) => {
		return selectedUsers.some((u) => u.id === user.id);
	};

	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.selector} onClick={() => setIsOpen(!isOpen)}>
				{selectedUsers.length > 0 ? (
					<div className={styles.selectedUsers}>
						{selectedUsers.map((user) => (
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
						{filteredUsers.map((user) => (
							<div
								key={user.id}
								className={`${styles.userItem} ${isUserSelected(user) ? styles.selected : ''}`}
								onClick={() => {
									if (user.id !== currentUser.id) {
										handleUserToggle(user);
									}
								}}
							>
								<span className={styles.userName}>
									{user.full_name} ({user.department})
								</span>
								{isUserSelected(user) && <span className={styles.checkmark}>✓</span>}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default UserMultiSelector;
