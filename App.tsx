/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import EmbeddingService from './services/embeddingService';
import Loader from './components/Loader';
import ResultCard from './components/ResultCard';
import EmbeddingVector from './components/EmbeddingVector';
import type { RankedDocument, ModelLoadingProgress } from './types';

const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || 'w-5 h-5'}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75a1.25 1.25 0 00-1.25-1.25h-2.5A1.25 1.25 0 007.5 3.75v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const SunIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || 'w-6 h-6'}>
    <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 4.343a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM6.464 13.536a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM5.394 6.464a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06z" />
  </svg>
);

const MoonIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || 'w-6 h-6'}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const App: React.FC = () => {
  const [modelLoadingStatus, setModelLoadingStatus] = useState<ModelLoadingProgress | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [currentDocument, setCurrentDocument] = useState<string>('');
  const [results, setResults] = useState<RankedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [embeddingService, setEmbeddingService] = useState<EmbeddingService | null>(null);
  const [queryEmbedding, setQueryEmbedding] = useState<number[] | null>(null);
  const [documentEmbeddings, setDocumentEmbeddings] = useState<number[][] | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLoadModel = useCallback(async () => {
    if (modelReady || modelLoadingStatus) return;

    setError(null);
    try {
      const service = await EmbeddingService.getInstance((progress: ModelLoadingProgress) => {
        console.log('Loading file:', progress.file);
        setModelLoadingStatus({ ...progress, progress: Math.round(progress.progress) });
      });
      setEmbeddingService(service);
      setModelReady(true);
      setModelLoadingStatus(null);
    } catch (e) {
      setError("Failed to load the AI model. Please try again.");
      console.error(e);
      setModelLoadingStatus(null);
    }
  }, [modelReady, modelLoadingStatus]);

  const handleAddDocument = async () => {
    const newDoc = currentDocument.trim();
    if (newDoc && embeddingService) {
      const updatedDocuments = [...documents, newDoc];
      setDocuments(updatedDocuments);
      setCurrentDocument('');

      try {
        const { documentEmbeddings: newEmbeddingArray } = await embeddingService.embed('', [newDoc]);
        if (newEmbeddingArray && newEmbeddingArray.length > 0) {
          setDocumentEmbeddings(prevEmbeddings => [...(prevEmbeddings || []), ...newEmbeddingArray]);
        }
      } catch (err) {
        console.error("Failed to generate document embedding:", err);
        setDocuments(documents); 
        setError("Could not generate embedding for the document.");
      }
    }
  };

  const handleRemoveDocument = (indexToRemove: number) => {
    setDocuments(prevDocs => prevDocs.filter((_, index) => index !== indexToRemove));
    setDocumentEmbeddings(prevEmbeddings => {
      if (!prevEmbeddings) return null;
      return prevEmbeddings.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleCompare = useCallback(async () => {
    if (!query.trim() || documents.length === 0 || !embeddingService) return;

    setIsProcessing(true);
    setError(null);
    setResults([]);
    try {
      const { rankedDocuments, queryEmbedding, documentEmbeddings } = await embeddingService.embed(query, documents);
      setResults(rankedDocuments);
      setQueryEmbedding(queryEmbedding);
      setDocumentEmbeddings(documentEmbeddings);
    } catch (e) {
      setError("An error occurred during processing. Please try again.");
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [query, documents, embeddingService]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!newQuery.trim() || !embeddingService) {
      setQueryEmbedding(null);
      return;
    }

    debounceTimeout.current = window.setTimeout(async () => {
      try {
        const { queryEmbedding } = await embeddingService.embed(newQuery, []);
        setQueryEmbedding(queryEmbedding);
      } catch (err) {
        console.error("Failed to generate live query embedding:", err);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10 relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 dark:from-blue-400 dark:to-teal-300">
            In-Browser Semantic Search
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Using <span className="font-semibold text-teal-600 dark:text-teal-300">EmbeddingGemma</span> on your device</p>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="absolute top-0 right-0 p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-300">Inputs</h2>

            <div className="mb-6">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Query</label>
              <input
                type="text"
                id="query"
                value={query}
                onChange={handleQueryChange}
                placeholder="e.g., Which planet is known as the Red Planet?"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 transition disabled:opacity-50"
                disabled={!modelReady}
              />
              {queryEmbedding && (
                <div className="mt-2">
                  <EmbeddingVector vector={queryEmbedding} theme={theme} />
                </div>
              )}
            </div>

            <button
              onClick={handleCompare}
              disabled={!modelReady || isProcessing || !query.trim() || documents.length === 0}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 mb-6"
            >
              {isProcessing && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isProcessing ? 'Processing...' : 'Find Similar Documents'}
            </button>

            <div className="mb-4">
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Documents to Search</label>
              <div className="flex items-center gap-2">
                <textarea
                  id="document"
                  rows={2}
                  value={currentDocument}
                  onChange={(e) => setCurrentDocument(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddDocument(); } }}
                  placeholder="Paste a document snippet and press Enter or click Add"
                  className="flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 transition disabled:opacity-50"
                  disabled={!modelReady}
                />
                <button
                  onClick={handleAddDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed h-full"
                  disabled={!modelReady || !currentDocument.trim()}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-6 overflow-y-auto pr-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-full">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate pr-2">{doc}</p>
                    {documentEmbeddings && documentEmbeddings[index] && (
                      <div className="mt-2">
                        <EmbeddingVector vector={documentEmbeddings[index]} theme={theme} />
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleRemoveDocument(index)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition flex-shrink-0">
                    <TrashIcon />
                  </button>
                </div>
              ))}
              {documents.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-500 text-center pt-4">No documents added yet.</p>}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 min-h-[30rem]">
            <h2 className="text-2xl font-bold mb-4 text-teal-600 dark:text-teal-300">Results</h2>
            {isProcessing && <div className="flex justify-center pt-20"><Loader message="Calculating similarities..." /></div>}
            {error && !isProcessing && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
            {!isProcessing && results.length > 0 && (
              <div className="space-y-4">
                {results.map((doc, index) => (
                   <div key={doc.index} style={{ animationDelay: `${index * 100}ms` }} className="animate-[slideUp_0.5s_ease-out_forwards] opacity-0">
                      <ResultCard doc={doc} rank={index + 1} />
                   </div>
                ))}
              </div>
            )}
            {!isProcessing && results.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-500">
                  { modelReady ? 'Results will be displayed here.' : 'Load the model to begin.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!modelReady && (
        <div className="absolute inset-0 bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center p-4">
          {!modelLoadingStatus ? (
            <>
              <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-300">Welcome!</h1>
              <p className="max-w-md mb-8 text-gray-600 dark:text-gray-400">
                This app runs an AI model directly in your browser. To begin, please load the model files.
              </p>
              <button
                onClick={handleLoadModel}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-md transition text-lg"
              >
                Load AI Model
              </button>
              {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-300">Loading AI Model</h1>
              <p className="mb-8 text-gray-600 dark:text-gray-400">Please wait, this may take a moment...</p>
              <Loader message={`${modelLoadingStatus.status}: ${modelLoadingStatus.file} (${modelLoadingStatus.progress}%)`} />
              {error && <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;