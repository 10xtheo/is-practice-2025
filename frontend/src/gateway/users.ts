import { IUser } from "types/user";
import { requestUsers } from "./api";

const getUsers = () => requestUsers.get<IUser[]>('');

export default {
  getUsers
} 