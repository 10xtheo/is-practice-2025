import React, { FC, useRef, useState } from 'react';
import { useClickOutside } from 'hooks/index';
import cn from 'classnames';

import styles from './select.module.scss';

interface ISelectOption {
	value: string;
	label: string;
}

interface ISelectProps {
	name: string;
	value: string;
	options: ISelectOption[];
	placeholder?: string;
	error?: string;
	fullWidth?: boolean;
	onChange: (value: string) => void;
}

const Select: FC<ISelectProps> = ({ name, value, options, placeholder, error, fullWidth, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef<HTMLDivElement>(null);

	const toggleOpen = () => setIsOpen(!isOpen);
	const close = () => setIsOpen(false);

	useClickOutside(selectRef, close);

	const selectedOption = options.find((option) => option.value === value);

	return (
		<div
			className={cn(styles.select, {
				[styles.select_fullWidth]: fullWidth,
			})}
			ref={selectRef}
		>
			<div
				className={cn(styles.select__header, {
					[styles.select__header_error]: error,
				})}
				onClick={toggleOpen}
			>
				<span className={styles.select__header__value}>{selectedOption?.label || placeholder}</span>
				<i className={cn('fas fa-chevron-down', styles.select__header__icon)}></i>
			</div>
			{isOpen && (
				<div className={styles.select__options}>
					{options.map((option) => (
						<div
							key={option.value}
							className={cn(styles.select__option, {
								[styles.select__option_selected]: option.value === value,
							})}
							onClick={() => {
								onChange(option.value);
								close();
							}}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
			{error && <div className={styles.select__error}>{error}</div>}
		</div>
	);
};

export default Select;
