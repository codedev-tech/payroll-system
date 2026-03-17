import apiClient from '../client';
import { buildQueryParams } from '../utils';

/**
 * Base Resource class to enforce Step 1: Resource-Based URLs
 */
class BaseResource {
  constructor(resourceName) {
    this.resource = resourceName;
  }

  /**
   * GET /resources
   * Handles Step 5 (Pagination) and Step 8 (Filtering/Sorting)
   */
  list(params = {}) {
    return apiClient.get(`/${this.resource}`, {
      params: buildQueryParams(params)
    });
  }

  /**
   * POST /resources
   * Implementation should NOT use verbs like /create-resource
   */
  create(data) {
    return apiClient.post(`/${this.resource}`, data);
  }

  /**
   * GET /resources/:id
   */
  get(id) {
    return apiClient.get(`/${this.resource}/${id}`);
  }

  /**
   * PUT /resources/:id
   * Complete update
   */
  update(id, data) {
    return apiClient.put(`/${this.resource}/${id}`, data);
  }

  /**
   * PATCH /resources/:id
   * Partial update
   */
  patch(id, data) {
    return apiClient.patch(`/${this.resource}/${id}`, data);
  }

  /**
   * DELETE /resources/:id
   */
  delete(id) {
    return apiClient.delete(`/${this.resource}/${id}`);
  }
}

export default BaseResource;
