import { EventPermission } from "./event";

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  position: string;
  department: string;
}

export interface IServerUserParticipant {
  user_id: string;
  is_creator: boolean;
  is_listener: boolean;
  permissions: EventPermission;
}

export interface IServerExtendedUserParticipant {
  user: IUser;
  is_creator: boolean;
  is_listener: boolean;
  permissions: EventPermission;
}


export interface IUserCreate {
  full_name: string;
  position: string;
  department: string;
}