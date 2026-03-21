import apiClient from '../client';

class LeaveRequestsResource {
  list(params = {}) {
    return apiClient.get('/leave-requests', { params });
  }

  create(payload) {
    return apiClient.post('/leave-requests', payload);
  }

  approve(id, payload) {
    return apiClient.post(`/leave-requests/${id}/approve`, payload);
  }

  reject(id, payload) {
    return apiClient.post(`/leave-requests/${id}/reject`, payload);
  }
}

export const leaveRequestsApi = new LeaveRequestsResource();
