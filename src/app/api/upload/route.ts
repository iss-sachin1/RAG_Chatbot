import { NextRequest, NextResponse } from 'next/server';
import { extractText } from '@/lib/parser';
import { getIndex } from '@/lib/vectorstore';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';

// PDF parsing + embedding can take a while; run on Node.js (we use Buffer,
// pdf-parse, etc.) and allow up to 60s on platforms that honor this.
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Extract text using Tesseract/pdf-parse
    console.log(`Extracting text from ${file.name} (${file.type})...`);
    const text = await extractText(buffer, file.type);

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'No text could be extracted from the document.' }, { status: 400 });
    }

    // 2. Chunk text using LangChain
    console.log('Chunking text...');
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([text]);

    // 3. Store in Upstash Vector. We send raw text via `data`; Upstash embeds it
    //    server-side using the index's built-in embedding model.
    console.log(`Indexing ${chunks.length} chunks into Upstash Vector...`);
    const index = getIndex();

    const vectors = chunks.map((c) => ({
      id: uuidv4(),
      data: c.pageContent,
      metadata: { source: file.name, text: c.pageContent },
    }));

    await index.upsert(vectors);

    console.log('Document indexed successfully.');
    return NextResponse.json({ success: true, chunksIndexed: chunks.length });

  } catch (error) {
    console.error('Error during upload processing:', error);
    const message = error instanceof Error ? error.message : 'Failed to process document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
