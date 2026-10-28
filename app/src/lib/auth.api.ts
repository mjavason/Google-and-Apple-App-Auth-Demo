import { apiRequest } from './api';

interface CurrentUser {
  uid: string;
  email?: string;
  name?: string;
}

const user = await apiRequest<CurrentUser>('/api/users/me');

console.log(user);
