export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: string;
  active?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  active?: boolean;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
