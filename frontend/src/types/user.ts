export interface IUser {
  id: string;
  full_name: string;
  position: string;
  department: string;
}

export interface IUserCreate {
  full_name: string;
  position: string;
  department: string;
}