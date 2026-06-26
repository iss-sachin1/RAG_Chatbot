import { NextRequest, NextResponse } from 'next/server';
import { extractText } from '@/lib/parser';
import { getCollection } from '@/lib/chroma';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';

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

    // 3. Store in ChromaDB
    console.log(`Indexing ${chunks.length} chunks into ChromaDB...`);
    const collection = await getCollection();
    
    const ids = chunks.map(() => uuidv4());
    const documents = chunks.map(c => c.pageContent);
    const metadatas = chunks.map(() => ({ source: file.name }));

    // ChromaDB's default embedding function will be used if no embeddings are explicitly passed to it here
    await collection.add({
      ids,
      documents,
      metadatas,
    });

    console.log('Document indexed successfully.');
    return NextResponse.json({ success: true, chunksIndexed: chunks.length });

  } catch (error) {
    console.error('Error during upload processing:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}
