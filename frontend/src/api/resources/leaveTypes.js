import BaseResource from './base';

class LeaveTypesResource extends BaseResource {
  constructor() {
    super('leave-types');
  }
}

export const leaveTypesApi = new LeaveTypesResource();
