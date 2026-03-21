import BaseResource from './base';

class EmployeeResource extends BaseResource {
  constructor() {
    super('employees');
  }
}

export const employeesApi = new EmployeeResource();
