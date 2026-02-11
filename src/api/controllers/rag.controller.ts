import * as ragService from "../services/rag.service.js";

/**
 * RAG (Retrieval-Augmented Generation) API controller.
 * Endpoints here are intended for testing and driving the RAG implementation.
 */

/**
 * Runs the RAG chat chain with the provided message body.
 *
 * @param body – Parsed request body with { message: string }
 * @param _requestUserId – Authenticated user id (from JWT), for future use (e.g. scoping, audit).
 * @returns Reply from the chain and timestamp.
 */
export async function testRag(
  body: { message: string },
  _requestUserId?: string
) {
  return ragService.runRagChat(body);
}
