import React, { FC, useState, MouseEvent } from 'react';
import { ICalendar, ICalendarCreate } from 'types/calendar';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useActions, usePopup } from 'hooks/index';
import ModalCreateCalendar from 'components/common/modals/modal-create-calendar/ModalCreateCalendar';
import './CalendarsList.scss';
import { getCalendars } from 'store/calendars/actions';
import { getEvents } from 'store/events/actions';

interface CalendarsListProps {
	onSelectedCalendarsChange: (selectedIds: string[]) => void;
}

const CalendarsList: FC<CalendarsListProps> = ({ onSelectedCalendarsChange }) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { calendars, selectedCalendarIds } = useTypedSelector(({ calendars }) => calendars);
	const { createCalendar, setSelectedCalendars } = useActions();
	const { openPopup } = usePopup();

	const handleCalendarSelect = (calendarId: string) => {
		const newSelectedIds = selectedCalendarIds.includes(calendarId)
			? selectedCalendarIds.filter((id) => id !== calendarId)
			: [...selectedCalendarIds, calendarId];

		setSelectedCalendars(newSelectedIds);
		onSelectedCalendarsChange(newSelectedIds);
	};

	const handleCalendarContextMenu = (e: MouseEvent<HTMLDivElement>, calendar: ICalendar) => {
		e.preventDefault();
		e.stopPropagation();

		const { clientX, clientY } = e;
		openPopup({
			x: clientX,
			y: clientY,
			calendarId: calendar.id,
		});
	};

	const onCreateCalendar = (calendar: ICalendarCreate) => {
		console.log('calendar', calendar);

		createCalendar(calendar);
		getCalendars();
		// getEvents();
	};

	return (
		<div className="calendars-list">
			<div className="calendars-list__header">
				<span>Доступные календари</span>
				<div className="calendars-list__controls">
					<button className="calendars-list__add-btn" onClick={() => setIsModalOpen(true)}>
						<i className="fas fa-plus"></i>
					</button>
					<button className="calendars-list__toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
						<i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
					</button>
				</div>
			</div>
			{isExpanded && (
				<div className="calendars-list__items">
					{calendars.map((calendar) => (
						<div
							key={calendar.id}
							className="calendars-list__item"
							onContextMenu={(e) => handleCalendarContextMenu(e, calendar)}
						>
							<input
								type="checkbox"
								id={`calendar-${calendar.id}`}
								checked={selectedCalendarIds.includes(calendar.id)}
								onChange={() => handleCalendarSelect(calendar.id)}
							/>
							<label htmlFor={`calendar-${calendar.id}`}>
								<span
									className="calendars-list__color-indicator"
									style={{ backgroundColor: calendar.color }}
								/>
								{calendar.title}
							</label>
						</div>
					))}
				</div>
			)}
			<ModalCreateCalendar
				isOpen={isModalOpen}
				closeModal={() => setIsModalOpen(false)}
				handlerSubmit={onCreateCalendar}
			/>
		</div>
	);
};

export default CalendarsList;
