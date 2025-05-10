import { IServerExtendedUserParticipant, IServerUserParticipant, IUser, IServerUser } from './user';
import { IChatMessage } from '../components/common/EventChat';

export interface IServerEvent {
	id: string;
	title: string;
	description: string;
	start: string;
	end: string;
	repeat_type: RepeatType;
	repeat_until: string | null;
	repeat_step: number;
	is_private: boolean;
	creator_id: string;
	is_finished: boolean;
	max_repeats_count: number;
	color: string;
	type: EventType;
	priority: EventPriority;
	eventcategories: IServerEventCategory[];
	eventparticipants: IServerExtendedUserParticipant[];
}

export interface IServerEventCategory {
	category_id: string;
}

export interface IEvent {
	id: string;
	title: string;
	description: string;
	start: number; // timestamp
	end: number; // timestamp
	repeat_type: RepeatType;
	repeat_until: number | null; // timestamp
	repeat_step: number;
	is_private: boolean;
	creator_id: string;
	is_finished: boolean;
	max_repeats_count: number;
	color: string;
	type: EventType;
	priority: EventPriority;
	category_id: string;
	participants: IServerUser[];
}

export type TPartialEvent = Partial<IEvent>;

export interface IEventCreate {
	title: string;
	description: string;
	start: number;
	end: number;
	repeat_type?: RepeatType;
	repeat_until?: number; // timestamp
	repeat_step: number;
	is_private: boolean;
	max_repeats_count: number; // @TODO ивент может повторяться до даты!
	color: string;
	type: EventType;
	priority: EventPriority;
	category_id: string;
	participants: IServerUser[];
}

export interface IServerEventCreate {
	title: string;
	description: string;
	start: Date;
	end: Date;
	repeat_type?: RepeatType;
	repeat_until?: Date;
	repeat_step: number;
	is_private: boolean;
	max_repeats_count: number;
	type: EventType;
	priority: EventPriority;
	category_id: string; // @TODO много категорий
	participants: IServerUserParticipant[];
}

export interface IEventTimeManagement {
	duration_minutes: number;
	participant_ids: string[];
	start_date: string;
	end_date: string;
}

export interface IEventChatHistory extends IChatMessage {
	content: string;
	event_id: string;
	user_id: string;
	full_name: string;
	timestamp: string;
	id: string;
}

export enum EventType {
	MEETING = 'meeting',
	TASK = 'task',
	REMINDER = 'reminder',
	HOLIDAY = 'holiday',
}

export enum EventPriority {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
}

export enum EventPermission {
	VIEW = 'view',
	EDIT = 'edit',
	ORGANIZE = 'organize',
}

export enum RepeatType {
	NONE = 'none',
	HOURLY = 'hourly',
	DAILY = 'daily',
	WEEKLY = 'weekly',
	MONTHLY = 'monthly',
	YEARLY = 'yearly',
	RECURRING_PARENT = 'recurring_parent',
	RECURRING_DUPLICATE = 'recurring_duplicate',
}
