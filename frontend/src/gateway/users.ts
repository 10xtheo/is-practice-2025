import { IUser, IUserUpdate } from 'types/user';
import { requestUsers } from './api';

const getMe = () => requestUsers.get<IUser>('/me');
const getUsers = () => requestUsers.get<{ data: IUser[]; count: number }>('/select');
const patchUser = (userData: IUserUpdate) => requestUsers.patch<IUser>(`/me`, userData);

export default {
	getMe,
	getUsers,
	patchUser,
};
