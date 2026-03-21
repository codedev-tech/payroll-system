import apiClient from '../client';

class AnalyticsResource {
  dashboard() {
    return apiClient.get('/analytics/dashboard');
  }

  payroll(params = {}) {
    return apiClient.get('/analytics/payroll', { params });
  }

  reports(params = {}) {
    return apiClient.get('/analytics/reports', { params });
  }
}

export const analyticsApi = new AnalyticsResource();
