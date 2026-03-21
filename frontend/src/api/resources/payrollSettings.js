import apiClient from '../client';

class PayrollSettingsResource {
  get() {
    return apiClient.get('/payroll-settings');
  }

  update(payload) {
    return apiClient.put('/payroll-settings', payload);
  }
}

export const payrollSettingsApi = new PayrollSettingsResource();
