# RAG (Retrieval-Augmented Generation)

This folder holds **RAG logic** using LangChain. It is where SwanyBot and DonatelloBot behavior is implemented (retrieval, generation, orchestration). User-facing communication happens through the **channels** (WhatsApp, Discord) in `src/channels`, which can call into this layer when a user message needs a RAG response.
