import React, { FC } from 'react';
import { useCalendar } from 'hooks/useCalendar';
import { useModal, useTypedSelector } from 'hooks/index';
import { createDate, getNextStartMinutes, shmoment } from 'utils/date';
import WeekCalendar from './components/week-calendar/WeekCalendar';
import Header from 'components/common/header/Header';
import YearCalendar from './components/year-calendar/YearCalendar';
import MonthCalendar from './components/month-calendar/MonthCalendar';

import './calendar.scss';

interface ICalendarProps {
	onMenuToggle?: () => void;
}

const Calendar: FC<ICalendarProps> = ({ onMenuToggle }) => {
	const { state, functions } = useCalendar({ selectedDate: new Date() });
	const { selectedCalendarIds } = useTypedSelector(({ calendars }) => calendars);

	const { isOpenModalCreateEvent, isOpenModalDayInfoEvents, isOpenModalEditEvent, openModalCreate } = useModal();

	const isBtnCreateEventDisable = isOpenModalCreateEvent || isOpenModalDayInfoEvents || isOpenModalEditEvent;

	const handleOpenModal = () => {
		const date = new Date();
		const { hours, minutes } = createDate({ date: date });
		const startMins = getNextStartMinutes(minutes);
		const selectedDate = shmoment(state.selectedDay.date)
			.set('hours', hours)
			.set('minutes', startMins + minutes)
			.result();

		window['selectedUsers'] = [];
		window['listenerUsers'] = [];
		openModalCreate({ selectedDate });
	};

	return (
		<>
			<Header
				onProfileClick={() => {
					window.location.href = '/profile';
				}}
				onClickArrow={functions.onClickArrow}
				displayedDate={state.displayedDate}
				onChangeOption={functions.setMode}
				selectedOption={state.mode}
				selectedDay={state.selectedDay}
				onMenuToggle={onMenuToggle}
			/>
			<section className="calendar">
				<button className="calendar__create-btn" onClick={handleOpenModal} disabled={isBtnCreateEventDisable}>
					<svg width="30" height="30" viewBox="3 3 30 30">
						<path fill="#000000" d="M16 16v14h4V20z"></path>
						<path fill="#000000" d="M30 16H20l-4 4h14z"></path>
						<path fill="#000000" d="M6 16v4h10l4-4z"></path>
						<path fill="#000000" d="M20 16V6h-4v14z"></path>
						<path fill="none" d="M0 0h32v32H0z"></path>
					</svg>
				</button>
				{state.mode === 'year' && (
					<YearCalendar
						selectedDay={state.selectedDay}
						selectedMonth={state.selectedMonth}
						monthesNames={state.monthesNames}
						weekDaysNames={state.weekDaysNames}
						calendarDaysOfYear={state.calendarDaysOfYear}
						onChangeState={functions.onChangeState}
					/>
				)}

				{state.mode === 'month' && (
					<MonthCalendar
						weekDaysNames={state.weekDaysNames}
						calendarDaysOfMonth={state.calendarDaysOfMonth}
						selectedMonth={state.selectedMonth}
						onClickArrow={functions.onClickArrow}
						selectedCalendarIds={selectedCalendarIds}
					/>
				)}

				{state.mode === 'week' && (
					<WeekCalendar
						weekDays={state.weekDays}
						weekDaysNames={state.weekDaysNames}
						selectedCalendarIds={selectedCalendarIds}
					/>
				)}
			</section>
		</>
	);
};

export default Calendar;
