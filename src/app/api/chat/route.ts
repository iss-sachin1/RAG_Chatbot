import { NextRequest, NextResponse } from 'next/server';
import { getIndex } from '@/lib/vectorstore';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { FakeListChatModel } from '@langchain/core/utils/testing';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Returns the chat model. Uses NVIDIA-hosted MiniMax-M3 (OpenAI-compatible API)
 * when NVIDIA_API_KEY is set, otherwise falls back to a placeholder model so the
 * app still runs without a key.
 */
function getChatModel() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.warn('NVIDIA_API_KEY not set — using placeholder responses. Add it to .env.');
    return new FakeListChatModel({
      responses: [
        "This is a placeholder response. Add your NVIDIA API key to the .env file (NVIDIA_API_KEY) to get real answers from MiniMax-M3."
      ]
    });
  }

  return new ChatOpenAI({
    apiKey,
    model: process.env.NVIDIA_MODEL || 'minimaxai/minimax-m3',
    temperature: 0.2,
    // NVIDIA's MiniMax-M3 endpoint returns an empty `choices: []` (HTTP 200)
    // when no output-token cap is sent, which surfaces as "Failed to process
    // chat query". An explicit maxTokens keeps responses non-empty.
    maxTokens: 1024,
    configuration: {
      baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Retrieve context from Upstash Vector. We query by raw text; Upstash
    //    embeds it server-side using the index's built-in embedding model.
    const index = getIndex();
    const results = await index.query({
      data: query,
      topK: 3, // Get top 3 chunks
      includeMetadata: true,
    });

    const documents = results
      .map((r) => (r.metadata?.text as string) ?? '')
      .filter((t) => t.length > 0);
    const context = documents.join('\n\n---\n\n');

    // 2. Setup LangChain prompt
    const prompt = PromptTemplate.fromTemplate(`
      You are a helpful AI assistant. Answer the user's question based ONLY on the following context.
      If the answer is not in the context, say "I don't know based on the provided document."

      Write your answer as clean, plain text. Do NOT use Markdown formatting:
      no #, ##, or ### headings, no ** or * for bold/italics, no backticks. Use
      simple hyphen bullets only when a list genuinely helps.

      Context:
      {context}

      Question: {question}
      Answer:
    `);

    const formattedPrompt = await prompt.format({
      context: context || "No relevant documents found.",
      question: query
    });

    // 3. Generate the answer with the configured chat model (NVIDIA MiniMax-M3).
    const llm = getChatModel();

    console.log('Sending prompt to LLM...');
    const response = await llm.invoke(formattedPrompt);
    const answer = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    return NextResponse.json({ answer, sources: documents });

  } catch (error) {
    console.error('Chat API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process chat query';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
