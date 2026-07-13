"use client";

import { useState, useRef, FormEvent, ChangeEvent } from 'react';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  sources?: string[];
};

// Strips Markdown syntax so assistant answers render as clean plain text.
function cleanMarkdown(text: string): string {
  return text
    // Headings: "## Title" -> "Title"
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    // Bold/italic: **x**, __x__, *x*, _x_ -> x
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Inline code / code fences: remove backticks
    .replace(/`{1,3}/g, '')
    // Bullet markers: "- item" / "* item" / "+ item" -> "• item"
    .replace(/^\s{0,3}[-*+]\s+/gm, '• ')
    // Blockquote markers
    .replace(/^\s{0,3}>\s?/gm, '')
    // Collapse 3+ blank lines down to a single blank line
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function RAGChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      text: "I'm ready! Please upload a PDF or Image using the attach button below to get started.",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeDocs, setActiveDocs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sends a chat query to the backend and appends the assistant's reply.
  const sendQuery = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || data.error || "An error occurred.",
        isUser: false,
        sources: data.sources && data.sources.length > 0 ? data.sources : undefined
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Network error.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || isUploading) return;

    const text = input.trim();
    // Nothing to do unless there's a prompt and/or a staged PDF.
    if (!text && !pendingFile) return;

    const fileToUpload = pendingFile;
    setInput('');
    setPendingFile(null);

    // 1. Index the staged PDF first, if one is attached.
    if (fileToUpload) {
      const ok = await uploadFile(fileToUpload);
      if (!ok) {
        // Upload failed — restore the prompt and attachment so the user can retry.
        setPendingFile(fileToUpload);
        if (text) setInput(text);
        return;
      }
    }

    // 2. Send the prompt, if one was typed.
    if (text) {
      await sendQuery(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Stage the selected file in the composer instead of uploading immediately.
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setPendingFile(e.target.files[0]);
    // Reset so picking the same file again still fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Uploads and indexes a file. Returns true on success.
  const uploadFile = async (file: File): Promise<boolean> => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setActiveDocs(prev => [...prev, file.name]);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Successfully uploaded and indexed ${file.name} (${data.chunksIndexed} chunks).`,
          isUser: false
        }]);
        return true;
      }
      alert(data.error || "Failed to upload document.");
      return false;
    } catch (err) {
      console.error(err);
      alert("Network error during file upload.");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop — visible only when the drawer is open on small screens. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`w-[280px] h-screen fixed left-0 top-0 bg-surface-dim border-r border-outline-variant flex flex-col p-gutter z-50 transition-transform duration-300 transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-surface-variant border border-outline-variant overflow-hidden flex-shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">robot_2</span>
          </div>
          <div>
            <div className="font-headline-md text-headline-md font-bold text-primary">Intelligent RAG</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">LangChain Powered</div>
          </div>
          {/* Close button — only on mobile. */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors md:hidden"
            title="Close menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <button className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(77,142,255,0.15)] mb-8 active:scale-95 duration-150">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Chat
        </button>

        <nav className="flex-1 overflow-y-auto space-y-6">
          <div>
            <div className="flex items-center gap-2 px-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">description</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Active Documents</span>
            </div>
            <ul className="space-y-1">
              {activeDocs.length === 0 && (
                <li className="px-3 py-2 text-on-surface-variant text-label-sm opacity-60">No documents uploaded.</li>
              )}
              {activeDocs.map((doc, idx) => (
                <li key={idx}>
                  <a href="#" className="flex items-center gap-2 w-full text-left px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-xl font-label-md text-label-md truncate transition-colors duration-200">
                    <span className="material-symbols-outlined text-[16px] text-error">picture_as_pdf</span>
                    <span className="truncate">{doc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="pt-4 border-t border-outline-variant mt-4 space-y-1">
          <a href="#" className="flex items-center gap-3 w-full text-left px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-xl font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </a>
        </div>
      </aside>

      <main className="md:ml-[280px] flex-1 flex flex-col relative h-screen bg-background w-full md:w-[calc(100%-280px)]">
        <header className="bg-surface/80 backdrop-blur-md flex justify-between items-center h-16 px-gutter border-b border-outline-variant sticky top-0 z-20 w-full">
          <div className="flex items-center gap-3">
            {/* Hamburger — opens the drawer on mobile. */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors md:hidden"
              title="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="font-headline-md text-headline-md font-extrabold text-primary">
              RAG Assistant
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm cursor-pointer">Models</a>
            <a href="#" className="text-primary font-bold border-b-2 border-primary pb-1 font-label-sm text-label-sm cursor-pointer">Settings</a>
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-max-content-width mx-auto px-4 md:px-gutter pb-[180px] flex flex-col gap-6 md:gap-8 pt-6 md:pt-8">
            <div className="flex flex-col items-center justify-center text-center mb-4">
              <h1 className="font-headline-xl text-headline-xl text-on-surface mb-4">Chat with your Documents</h1>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant font-label-md text-label-md shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">memory</span>
                Model: Local RAG Pipeline
              </div>
            </div>

            {messages.map(msg => (
              <div key={msg.id} className={`flex w-full justify-${msg.isUser ? 'end' : 'start'} max-w-4xl mx-auto`}>
                <div className={`flex gap-2 md:gap-4 w-full ${msg.isUser ? 'justify-end' : ''}`}>
                  {!msg.isUser && (
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[18px] text-primary">smart_toy</span>
                    </div>
                  )}
                  <div className={`border rounded-2xl p-4 md:p-5 font-body-md text-body-md shadow-sm ${
                    msg.isUser
                      ? 'bg-primary text-on-primary rounded-tr-sm max-w-[85%] border-transparent'
                      : 'bg-surface-container-low border-outline-variant rounded-tl-sm text-on-surface w-full flex flex-col gap-4'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.isUser ? msg.text : cleanMarkdown(msg.text)}</p>
                    
                    {msg.sources && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/30">
                        <span className="text-on-surface-variant font-label-sm text-label-sm py-1 mr-1">Sources:</span>
                        {msg.sources.map((src, i) => (
                          <button key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-variant/40 hover:bg-surface-variant border border-outline-variant hover:border-primary/50 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-all duration-200 cursor-pointer group">
                            <span className="material-symbols-outlined text-[14px] text-error group-hover:text-error/80">picture_as_pdf</span>
                            Chunk {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.isUser && (
                    <div className="w-8 h-8 rounded-lg bg-surface-variant border border-outline-variant overflow-hidden flex-shrink-0 mt-1 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex w-full justify-start max-w-4xl mx-auto">
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[18px] text-primary">smart_toy</span>
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant rounded-2xl rounded-tl-sm p-5 text-on-surface font-body-md text-body-md shadow-sm flex items-center gap-2">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-background/60 backdrop-blur-xl border-t border-outline-variant/30 px-4 md:px-gutter py-4 md:py-6 z-20">
          <div className="max-w-4xl mx-auto relative">
            {pendingFile && (
              <div className="mb-3 inline-flex items-center gap-2 max-w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-xl font-label-md text-label-md text-on-surface shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-error flex-shrink-0">picture_as_pdf</span>
                <span className="truncate">{pendingFile.name}</span>
                <span className="text-on-surface-variant/60 font-label-sm text-label-sm flex-shrink-0">
                  {isUploading ? 'Indexing…' : 'ready to send'}
                </span>
                <button
                  type="button"
                  onClick={() => setPendingFile(null)}
                  disabled={isUploading}
                  title="Remove attachment"
                  className="ml-1 p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            )}
            <div className="bg-surface-container-high/80 border border-outline-variant rounded-2xl flex items-end p-2 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-md">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="application/pdf,image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`p-3 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-variant/50 transition-colors flex-shrink-0 flex items-center justify-center group ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="Attach Document"
              >
                <span className={`material-symbols-outlined transition-colors ${isUploading ? 'animate-bounce' : 'group-hover:text-primary'}`}>
                  {isUploading ? 'hourglass_empty' : 'attach_file'}
                </span>
              </button>
              
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none text-on-surface font-body-md text-body-md resize-none max-h-40 min-h-[52px] py-3 px-2 focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/50"
                placeholder={pendingFile ? "Add a prompt to send with your PDF (optional)…" : "Message RAG Assistant..."}
                rows={1}
                style={{scrollbarWidth: 'none'}}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || isUploading || (!input.trim() && !pendingFile)}
                className={`p-3 bg-primary text-on-primary rounded-xl hover:bg-primary-fixed transition-colors flex-shrink-0 ml-2 h-12 w-12 flex items-center justify-center shadow-md active:scale-95 duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
              </button>
            </div>
            <div className="text-center mt-3 text-on-surface-variant/60 font-label-sm text-label-sm">
              AI can make mistakes. Verify critical information in the provided source documents.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
