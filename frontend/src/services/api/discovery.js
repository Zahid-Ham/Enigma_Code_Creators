/**
 * Recurrence & Discovery API Service
 */

import { apiClient } from './apiClient';

/**
 * Retrieve all recurring financial relationships discovered for an estate.
 * @param {string} estateId - The estate identifier (e.g. 'demo-estate-001').
 * @returns {Promise<Object>} EstateRecurrenceResponse containing observation_window, total_transactions_analyzed, and relationships list.
 */
export async function getRecurringRelationships(estateId = 'demo-estate-001') {
  const response = await apiClient.get(`/discovery/recurring/${estateId}`);
  return response.data;
}

/**
 * Retrieve fine-grained details for a specific recurring relationship.
 * @param {string} estateId - The estate identifier.
 * @param {string} relationshipId - The relationship UUID or key.
 * @returns {Promise<Object>} RecurringRelationshipResponse with detailed transaction history, intervals, and gaps.
 */
export async function getRecurringRelationshipDetail(estateId, relationshipId) {
  const response = await apiClient.get(`/discovery/recurring/${estateId}/${relationshipId}`);
  return response.data;
}

/**
 * Ingest normalized transactions and run on-demand recurrence discovery.
 * @param {string} estateId - The estate identifier.
 * @param {Array<Object>} transactions - List of normalized transaction records.
 * @returns {Promise<Object>} EstateRecurrenceResponse.
 */
export async function analyzeTransactionsForRecurrence(estateId, transactions) {
  const response = await apiClient.post(`/discovery/recurring/${estateId}/analyze`, transactions);
  return response.data;
}
