import { api } from 'src/boot/axios';

export type RegisterRequest = {
  username?: string;
  email?: string;
  password: string;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type User = {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ErrorResponse = {
  error: string;
  message?: string;
};

export type SuccessResponse = {
  message: string;
  data?: any;
};

async function register(data: RegisterRequest): Promise<SuccessResponse> {
  const response = await api.post<SuccessResponse>('/auth/register', data);
  return response.data;
}

async function login(data: LoginRequest): Promise<SuccessResponse> {
  const response = await api.post<SuccessResponse>('/auth/login', data);
  return response.data;
}

async function logout(): Promise<SuccessResponse> {
  const response = await api.post<SuccessResponse>('/auth/logout');
  return response.data;
}

async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/users/me');
  return response.data;
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
};
