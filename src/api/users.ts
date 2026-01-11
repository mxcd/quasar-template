import { api } from 'src/boot/axios';
import type { User } from 'src/api/authentication';
import { ListResponse, PaginationParameters } from 'src/api/util';

export type UsersListParams = PaginationParameters & {
  search?: string;
}

export type CreateUserRequest = {
  username: string;
  password: string;
  name: string;
  email?: string;
  active?: boolean;
  role?: string;
}

export type UpdateUserRequest = {
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  active?: boolean;
  role?: string;
}

async function list(params: UsersListParams = {}): Promise<ListResponse<User>> {
  const response = await api.get<ListResponse<User>>('/users', { params });
  return response.data;
}

async function id(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}

async function create(data: CreateUserRequest): Promise<User> {
  const response = await api.post<User>('/users', data);
  return response.data;
}

async function update(id: string, data: UpdateUserRequest): Promise<User> {
  const response = await api.put<User>(`/users/${id}`, data);
  return response.data;
}

async function remove(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export default {
  list,
  id,
  create,
  update,
  remove,
};
