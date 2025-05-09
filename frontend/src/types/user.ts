import { EventPermission } from "./event";
import { CategoryPermission } from "./calendar";

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  position: string;
  department: string;
}

export interface IServerUser extends IUser {
  id: string;
  email: string;
  full_name: string;
  position: string;
  department: string;
  is_creator?: boolean;
  is_listener?: boolean;
  permissions?: EventPermission;
}

export interface IServerUserParticipant {
  user_id: string;
  is_creator: boolean;
  is_listener: boolean;
  permissions: EventPermission;
}

export interface IServerUserCategoryParticipant {
  user_id: string;
  is_creator: boolean;
  permissions: CategoryPermission;
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

export interface IUserUpdate {
  full_name: string;
  email: string;
}