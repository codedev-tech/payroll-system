import apiClient from '../client';

class AuthResource {
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  }

  me(userId) {
    return apiClient.get('/auth/me', {
      params: {
        user_id: userId,
      },
    });
  }

  changePassword(payload) {
    return apiClient.post('/auth/change-password', payload);
  }
}

export const authApi = new AuthResource();
