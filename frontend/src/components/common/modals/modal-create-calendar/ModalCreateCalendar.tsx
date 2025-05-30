import React, { FC, useState } from 'react';
import { CategoryPermission, ICalendarCreate, TPartialCalendar } from 'types/calendar';
import './ModalCreateCalendar.scss';
import { useTypedSelector } from 'hooks/index';
import { TSubmitHandler } from 'hooks/useForm/types';
import { IModalValuesCalendar } from '../types';
import { useForm } from 'hooks/useForm';
import UserMultiSelector from 'components/user-multi-selector/UserMultiSelector';
import { getCalendars } from 'store/calendars/actions';
import { useDispatch } from 'react-redux';
import { store } from 'store/store';

interface ModalCreateCalendarProps {
	isOpen: boolean;
	closeModal: () => void;
	handlerSubmit: (calendarData: ICalendarCreate) => void;
}

const ModalCreateCalendar: FC<ModalCreateCalendarProps> = ({ isOpen, closeModal, handlerSubmit }) => {
	const { user } = useTypedSelector(({ users }) => users);
	const currentUser = user;
	const dispatch = useDispatch<typeof store.dispatch>();
	const { values, handleChange, handleSubmit, setValue, errors, submitting } = useForm<IModalValuesCalendar>({
		defaultValues: {
			title: '',
			participants: [],
		},
		// rules: createEventSchema
	});

	const onSubmit: TSubmitHandler<IModalValuesCalendar> = async (data) => {
		const newCalendar: ICalendarCreate = {
			title: data.title,
			participants: data.participants.map((uid) => ({
				user_id: uid,
				is_creator: currentUser.id === uid,
				permissions: currentUser.id === uid ? CategoryPermission.MANAGE : CategoryPermission.EDIT,
			})),
		};

		try {
			await handlerSubmit(newCalendar);
			closeModal();
			window['selectedUsers'] = [];
			await dispatch(getCalendars());
		} catch (error) {
			console.error('Error creating calendar:', error);
		}
	};

	if (!isOpen) return null;

	const onChangeTitle = (title: string) => {
		setValue('title', title);
	};

	const onChangeColor = (color: string) => {
		setValue('color', color);
	};

	return (
		<div className="modal-overlay" onClick={closeModal}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h2>Создать новый календарь</h2>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="form-group">
						<label htmlFor="title">Название</label>
						<input
							type="text"
							id="title"
							value={values.title}
							onChange={(e) => onChangeTitle(e.target.value)}
							required
						/>
					</div>
					{/* <div className="form-group">
            <label htmlFor="color">Цвет</label>
            <input
              type="color"
              id="color"
              value={values.color}
              onChange={(e) => onChangeColor(e.target.value)}
            />
          </div> */}
					<div className="form-group">
						<label htmlFor="title">Участники календаря</label>
						<UserMultiSelector
							defaultSelectedUsers={[user.id]}
							onChange={(users) => {
								setValue(
									'participants',
									users.map((user) => user.id),
								);
							}}
						/>
					</div>
					<div className="modal-actions">
						<button type="button" onClick={closeModal}>
							Отмена
						</button>
						<button type="submit">Создать</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ModalCreateCalendar;
