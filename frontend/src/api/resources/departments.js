import BaseResource from './base';

class DepartmentResource extends BaseResource {
  constructor() {
    super('departments');
  }
}

export const departmentsApi = new DepartmentResource();
