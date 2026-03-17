/**
 * Utilities for strictly following REST standards for Filtering, Sorting, and Pagination.
 * Refer to Step 5 and Step 8 in the article.
 */

/**
 * Builds standard query parameters for list requests.
 * @param {Object} params - { page, limit, sort, filter }
 * @returns {Object} Cleaned parameters for Axios
 */
export const buildQueryParams = ({ page, limit, sort, filter } = {}) => {
  const query = {};

  // Step 5: Pagination
  if (page) query.page = page;
  if (limit) query.limit = limit;

  // Step 8: Sorting (Standard format: ?sort=field:asc or ?sort=-field)
  if (sort) {
    if (typeof sort === 'string') {
      query.sort = sort;
    } else if (Array.isArray(sort)) {
      query.sort = sort.join(',');
    }
  }

  // Step 8: Filtering (Standard format: ?field=value or nested ?filter[field]=value)
  if (filter && typeof filter === 'object') {
    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
        query[key] = filter[key];
      }
    });
  }

  return query;
};

/**
 * Standardizes the response data extraction.
 * Professional REST APIs usually wrap the main payload in a 'data' key.
 */
export const extractData = (response) => response.data?.data || response.data;

/**
 * Standardizes the metadata extraction (for pagination).
 */
export const extractMeta = (response) => response.data?.meta || {};
