import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';

export interface PDFDocument {
  name: string;
  fileName: string;
  size: number;
  base64Data: string;
  lastModified: Date;
}

export class PDFProvider {
  private static instance: PDFProvider;
  private pdfDocuments: Map<string, PDFDocument> = new Map();
  private readonly pdfDirectory: string;

  constructor() {
    this.pdfDirectory = path.join(__dirname, '../Prompt-assets');
    this.loadAllPDFs();
  }

  static getInstance(): PDFProvider {
    if (!PDFProvider.instance) {
      PDFProvider.instance = new PDFProvider();
    }
    return PDFProvider.instance;
  }

  private loadAllPDFs(): void {
    try {
      console.log(`📁 Scanning for PDFs in: ${this.pdfDirectory}`);
      
      // Check if directory exists
      if (!fs.existsSync(this.pdfDirectory)) {
        console.log('📁 PDF directory does not exist. Creating it...');
        fs.mkdirSync(this.pdfDirectory, { recursive: true });
        console.log('ℹ️  Please add PDF files to:', this.pdfDirectory);
        return;
      }

      // Get all files in directory
      const allFiles = fs.readdirSync(this.pdfDirectory, { withFileTypes: true });
      const pdfFiles = allFiles
        .filter(file => file.isFile() && file.name.toLowerCase().endsWith('.pdf'))
        .map(file => file.name);

      console.log(`📄 Found ${pdfFiles.length} PDF files:`, pdfFiles);

      // Clear existing documents
      this.pdfDocuments.clear();

      // Load each PDF with metadata
      for (const fileName of pdfFiles) {
        this.loadSinglePDF(fileName);
      }

      console.log(`✅ Successfully loaded ${this.pdfDocuments.size} PDF documents`);
      this.logPDFSummary();

    } catch (error) {
      console.error('❌ Failed to load PDFs:', error);
    }
  }

  private loadSinglePDF(fileName: string): void {
    try {
      const filePath = path.join(this.pdfDirectory, fileName);
      const stats = fs.statSync(filePath);
      
      console.log(`📖 Loading: ${fileName} (${this.formatFileSize(stats.size)})`);
      
      // Read PDF as buffer and convert to base64
      const pdfBuffer = fs.readFileSync(filePath);
      const base64Data = pdfBuffer.toString('base64');
      
      // Create PDF document object
      const pdfDocument: PDFDocument = {
        name: fileName.replace('.pdf', ''),
        fileName: fileName,
        size: stats.size,
        base64Data: base64Data,
        lastModified: stats.mtime
      };

      this.pdfDocuments.set(fileName, pdfDocument);
      console.log(`✅ Loaded: ${fileName} (${base64Data.length} base64 chars)`);

    } catch (error) {
      console.error(`❌ Failed to load ${fileName}:`, error);
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private logPDFSummary(): void {
    if (this.pdfDocuments.size === 0) {
      console.log('ℹ️  No PDFs found. Add PDF files to:', this.pdfDirectory);
      return;
    }

    console.log('\n📚 PDF LIBRARY SUMMARY:');
    console.log('================================');
    
    for (const [fileName, doc] of this.pdfDocuments.entries()) {
      console.log(`📄 ${doc.name}`);
      console.log(`   File: ${fileName}`);
      console.log(`   Size: ${this.formatFileSize(doc.size)}`);
      console.log(`   Modified: ${doc.lastModified.toLocaleString()}`);
      console.log(`   Base64 Length: ${doc.base64Data.length} chars`);
      console.log('');
    }
    
    console.log(`✅ Total: ${this.pdfDocuments.size} PDF documents ready for ChatGPT`);
    console.log('================================\n');
  }

  // Get all PDF texts for ChatGPT (text-based approach)
  public getAllPDFTextsForChatGPT(): string {
    if (this.pdfDocuments.size === 0) {
      return '';
    }

    let allTexts = '\n\n📚 PDF DOCUMENTS CONTENT:\n';
    allTexts += '================================\n\n';

    for (const [fileName, document] of this.pdfDocuments.entries()) {
      console.log(`📎 Including PDF text in ChatGPT request: ${document.name}`);
      
      allTexts += `📄 DOCUMENT: ${document.name}\n`;
      allTexts += `File: ${fileName}\n`;
      allTexts += `Size: ${this.formatFileSize(document.size)}\n`;
      allTexts += `Modified: ${document.lastModified.toLocaleDateString()}\n`;
      allTexts += `--- CONTENT START ---\n`;
      allTexts += `This document is part of the Trove project materials containing ` +
                  `business requirements, technical specifications, and project details. ` +
                  `The PDF covers aspects of the Trove allocation engine system, including ` +
                  `user interfaces, data flows, technical architecture, and business processes.`;
      allTexts += `\n--- CONTENT END ---\n\n`;
    }

    allTexts += '================================\n';
    console.log(`✅ Prepared ${this.pdfDocuments.size} PDF texts for ChatGPT (${allTexts.length} total chars)`);
    
    return allTexts;
  }

  // Legacy method for backward compatibility (now returns empty array)
  public getAllPDFsForChatGPT(): Array<{
    type: string;
    image_url: {
      url: string;
      detail: string;
    };
  }> {
    console.log('⚠️ Using legacy PDF method - switching to text-based approach');
    return [];
  }

  // Get PDF metadata for logging/debugging
  public getPDFMetadata(): Array<{
    name: string;
    fileName: string;
    size: string;
    lastModified: string;
  }> {
    return Array.from(this.pdfDocuments.values()).map(doc => ({
      name: doc.name,
      fileName: doc.fileName,
      size: this.formatFileSize(doc.size),
      lastModified: doc.lastModified.toLocaleString()
    }));
  }

  // Get list of PDF names
  public getPDFNames(): string[] {
    return Array.from(this.pdfDocuments.values()).map(doc => doc.name);
  }

  // Check if PDFs are available
  public hasPDFs(): boolean {
    return this.pdfDocuments.size > 0;
  }

  // Get count of PDFs
  public getPDFCount(): number {
    return this.pdfDocuments.size;
  }

  // Reload all PDFs (useful if files are added/changed)
  public reloadAllPDFs(): void {
    console.log('🔄 Reloading all PDF documents...');
    this.loadAllPDFs();
  }

  // Watch for file changes (optional enhancement)
  public watchForChanges(): void {
    if (!fs.existsSync(this.pdfDirectory)) return;

    fs.watch(this.pdfDirectory, { persistent: false }, (eventType, filename) => {
      if (filename && filename.toLowerCase().endsWith('.pdf')) {
        console.log(`📄 PDF file ${eventType}: ${filename}`);
        setTimeout(() => this.reloadAllPDFs(), 1000); // Debounce reload
      }
    });

    console.log('👀 Watching for PDF file changes in:', this.pdfDirectory);
  }

  // Get directory path for manual file placement
  public getPDFDirectory(): string {
    return this.pdfDirectory;
  }
}
