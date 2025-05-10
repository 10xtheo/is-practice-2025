import React, { FC } from 'react';
import { getMapEventValues } from '../helpers';
import ModalFormEvent from '../modal-form-event/ModalFormEvent';
import { EventPermission, TPartialEvent } from 'types/event';
import { useActions, useModal, useTypedSelector } from 'hooks/index';
import { IModalEditEventOptions } from 'store/modals/types';
import { IServerUserParticipant } from 'types/user';
import { getEvents } from 'store/events/actions';
import { useDispatch } from 'react-redux';
import { store } from 'store/store';

const ModalEditEvent: FC<IModalEditEventOptions> = ({ eventData, eventId }) => {
	const dispatch = useDispatch<typeof store.dispatch>();
	const { updateEvent, addEventParticipant, deleteEventParticipant } = useActions();
	const { closeModalEdit } = useModal();
	const { user } = useTypedSelector(({ users }) => users);
	const currentUser = user;
	const startDate = new Date(eventData.start);
	const endDate = new Date(eventData.end);

	const defaultEventValues = getMapEventValues({
		title: eventData.title,
		description: eventData.description,
		startDate,
		endDate,
		type: eventData.type,
		color: eventData.color,
		category_id: eventData.category_id,
		participants: eventData.participants.filter((p) => !p.is_listener).map((participant) => participant.id),
		listeners: eventData.participants.filter((p) => p.is_listener).map((participant) => participant.id),
		priority: eventData.priority,
		is_finished: eventData.is_finished,
		repeat_step: eventData.repeat_step,
		is_private: eventData.is_private,
		max_repeats_count: eventData.max_repeats_count,
	});

	const onUpdateEvent = (event: TPartialEvent) => {
		updateEvent({ eventId, event });
		dispatch(getEvents());
	};

	let prevParticipants: string[] = defaultEventValues.participants;
	const handleParticipantsChange = async (users: { id: string }[]) => {
		// Предыдущее состояние содержало больше юзеров => нужно удаление
		if (prevParticipants.length > users.length) {
			for (const userId of prevParticipants.filter((pUserId) => !users.find((user) => user.id === pUserId))) {
				if (userId === currentUser.id) {
					continue;
				}
				await deleteEventParticipant({ eventId, userId });
			}
		} else {
			for (const user of users.filter((user) => !prevParticipants.includes(user.id))) {
				if (user.id === currentUser.id) {
					continue;
				}

				const participant: IServerUserParticipant = {
					user_id: user.id,
					is_creator: false,
					is_listener: false,
					permissions: EventPermission.EDIT,
				};
				await addEventParticipant({ eventId, participant });
			}
		}

		prevParticipants = users.map((u) => u.id);
	};

	let prevListeners: string[] = defaultEventValues.listeners;
	const handleListenersChange = async (users: { id: string }[]) => {
		// Предыдущее состояние содержало больше юзеров => нужно удаление
		if (prevListeners.length > users.length) {
			for (const userId of prevListeners.filter((pUserId) => !users.find((user) => user.id === pUserId))) {
				if (userId === currentUser.id) {
					continue;
				}
				await deleteEventParticipant({ eventId, userId });
			}
		} else {
			for (const user of users.filter((user) => !prevListeners.includes(user.id))) {
				if (user.id === currentUser.id) {
					continue;
				}

				const participant: IServerUserParticipant = {
					user_id: user.id,
					is_creator: false,
					is_listener: true,
					permissions: EventPermission.VIEW,
				};
				await addEventParticipant({ eventId, participant });
			}
		}

		prevListeners = users.map((u) => u.id);
	};

	return (
		<ModalFormEvent
			textSendButton="Изменить"
			textSendingBtn="Изменение..."
			defaultEventValues={defaultEventValues}
			handlerSubmit={onUpdateEvent}
			onParticipantsChange={handleParticipantsChange}
			onListenersChange={handleListenersChange}
			closeModal={async () => {
				closeModalEdit();
				window['selectedUsers'] = [];
				window['listenerUsers'] = [];
				await dispatch(getEvents());
			}}
		/>
	);
};

export default ModalEditEvent;
