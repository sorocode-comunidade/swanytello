/**
 * RAG (Retrieval-Augmented Generation) API controller.
 * Endpoints here are intended for testing and driving the RAG implementation.
 */

/**
 * Placeholder for the RAG test endpoint.
 * Will be used in the future to test the RAG implementation.
 *
 * @param _requestUserId – Authenticated user id (from JWT), for future use (e.g. scoping, audit).
 * @returns Stub response until RAG is wired.
 */
export async function testRag(_requestUserId?: string) {
  return {
    ok: true,
    message: "RAG test endpoint. Implementation pending.",
    timestamp: new Date().toISOString(),
  };
}
