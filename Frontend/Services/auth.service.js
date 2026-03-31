import { apiPost } from '/Services/api-client.js';

export function signIn(credentials) {
  return apiPost('/auth/signin', credentials, { includeAuth: false });
}

export function signUp(payload) {
  return apiPost('/auth/signup', payload, { includeAuth: false });
}
