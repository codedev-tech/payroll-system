import apiClient from '../client';

class HrEmployeeAccountResource {
  create(data) {
    return apiClient.post('/hr/employee-accounts', data);
  }
}

export const hrEmployeeAccountsApi = new HrEmployeeAccountResource();
