import BaseResource from './base';

/**
 * User resource following Step 1: No verbs in URLs
 * INCORRECT: /api/v1/get-users
 * CORRECT: /api/v1/users (GET)
 */
class UserResource extends BaseResource {
  constructor() {
    super('users');
  }

  // Example of a specialized resource action
  // INCORRECT: /api/v1/users/1/deactivate-user
  // CORRECT: /api/v1/users/1/status (PATCH with data) OR just a PATCH on users/1
  deactivate(id) {
    return this.patch(id, { status: 'inactive' });
  }
}

export const usersApi = new UserResource();
