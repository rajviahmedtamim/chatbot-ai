"use client";

import { useState } from "react";

interface UploadStats {
  source: string;
  type: string;
  textLength: number;
  chunksCreated: number;
  chunksAdded: number;
}

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<UploadStats | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await uploadDocument(formData);
  }

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    const formData = new FormData();
    formData.append("url", url);

    await uploadDocument(formData);
  }

  async function uploadDocument(formData: FormData) {
    setUploading(true);
    setMessage("");
    setError("");
    setStats(null);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage(data.message);
      setStats(data.stats);
      setUrl(""); // Clear URL input
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        📄 Upload Documents
      </h2>

      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Upload PDFs, DOCX files, or provide a website URL to add to the
        knowledge base
      </p>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload File (PDF, DOCX, TXT)
        </label>
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-900 dark:text-gray-300 
                     border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer 
                     bg-gray-50 dark:bg-gray-700 focus:outline-none
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     dark:file:bg-blue-900 dark:file:text-blue-300"
        />
      </div>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or Enter Website URL
        </label>
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={uploading || !url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-colors duration-200"
          >
            {uploading ? "Processing..." : "Add URL"}
          </button>
        </form>
      </div>

      {/* Status Messages */}
      {uploading && (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Processing document...</span>
        </div>
      )}

      {error && (
        <div
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
                        text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {message && stats && (
        <div
          className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 
                        text-green-700 dark:text-green-400 px-4 py-3 rounded-lg"
        >
          <p className="font-medium mb-2">✅ {message}</p>
          <div className="text-sm space-y-1">
            <p>
              📁 Source: <span className="font-mono">{stats.source}</span>
            </p>
            <p>
              📝 Type: <span className="font-mono uppercase">{stats.type}</span>
            </p>
            <p>
              📊 Text Length:{" "}
              <span className="font-mono">
                {stats.textLength.toLocaleString()}
              </span>{" "}
              characters
            </p>
            <p>
              🧩 Chunks Created:{" "}
              <span className="font-mono">{stats.chunksCreated}</span>
            </p>
            <p>
              ✨ Chunks Added:{" "}
              <span className="font-mono">{stats.chunksAdded}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
