import pdf from "pdf-parse";
import mammoth from "mammoth";
import * as cheerio from "cheerio";

/**
 * Extract text from a PDF file buffer
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Extract text from a DOCX file buffer
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX file");
  }
}

/**
 * Extract text from a website URL
 */
export async function parseWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, nav, footer, header").remove();

    // Get text from main content areas
    const text = $("body").text();

    // Clean up whitespace
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  } catch (error) {
    console.error("Error parsing website:", error);
    throw new Error(
      `Failed to parse website: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Parse any supported document type
 */
export async function parseDocument(
  source: Buffer | string,
  type: "pdf" | "docx" | "txt" | "url"
): Promise<string> {
  switch (type) {
    case "pdf":
      return parsePDF(source as Buffer);
    case "docx":
      return parseDOCX(source as Buffer);
    case "txt":
      return source.toString();
    case "url":
      return parseWebsite(source as string);
    default:
      throw new Error(`Unsupported document type: ${type}`);
  }
}

/**
 * Detect document type from filename or MIME type
 */
export function detectDocumentType(
  filename: string,
  mimeType?: string
): "pdf" | "docx" | "txt" | "url" | null {
  // Check if it's a URL
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return "url";
  }

  // Check by MIME type first
  if (mimeType) {
    if (mimeType === "application/pdf") return "pdf";
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      return "docx";
    }
    if (mimeType === "text/plain") return "txt";
  }

  // Fallback to extension
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "txt") return "txt";

  return null;
}
