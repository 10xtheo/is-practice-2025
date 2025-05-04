import { IUser } from "types/user";
import { requestUsers } from "./api";

const getMe = () => requestUsers.get<IUser>('/me');

export default {
  getMe
} 