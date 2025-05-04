import { IUser, IUserUpdate } from "types/user";
import { requestUsers } from "./api";

const getMe = () => requestUsers.get<IUser>('/me');
const patchUser = (userData: IUserUpdate) => requestUsers.patch<IUser>(`/me`, userData);

export default {
  getMe,
  patchUser
} 