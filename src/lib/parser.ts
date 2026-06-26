import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import Tesseract from 'tesseract.js';

/**
 * Extracts text from a document.
 * If the document is an image, it uses Tesseract.js for OCR.
 * If the document is a PDF, it uses LangChain's WebPDFLoader.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType.startsWith('image/')) {
    // Use OCR for images
    console.log('Running OCR on image...');
    const result = await Tesseract.recognize(buffer, 'eng');
    return result.data.text;
  } else if (mimeType === 'application/pdf') {
    // Parse PDF
    console.log('Parsing PDF with LangChain WebPDFLoader...');
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const loader = new WebPDFLoader(blob, { splitPages: false });
    const docs = await loader.load();
    
    let text = docs.map(d => d.pageContent).join('\n').trim();
    if (text.length < 50) {
      console.warn('PDF seems to contain very little text. It might be a scanned document requiring full OCR.');
    }
    return text;
  }
  
  throw new Error('Unsupported file type. Please upload a PDF or an Image.');
}
