import localforage from 'localforage';

// Define document categories
export enum DocumentCategory {
  Menu = 'menu',
  Reviews = 'reviews',
  FAQs = 'faqs',
  ChatHistory = 'chatHistory'
}

// Document interface
export interface Document {
  id: string;
  category: DocumentCategory;
  name: string;
  content: string;
  dateAdded: Date;
  size: number; // in bytes
}

// Initialize localforage instances for each category
const stores = {
  [DocumentCategory.Menu]: localforage.createInstance({ name: DocumentCategory.Menu }),
  [DocumentCategory.Reviews]: localforage.createInstance({ name: DocumentCategory.Reviews }),
  [DocumentCategory.FAQs]: localforage.createInstance({ name: DocumentCategory.FAQs }),
  [DocumentCategory.ChatHistory]: localforage.createInstance({ name: DocumentCategory.ChatHistory })
};

// Max document size (10MB in bytes)
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

// Check available storage space
export const checkStorageAvailability = async (): Promise<{ available: boolean; message: string }> => {
  try {
    // Check if storage is available
    if (!localforage.supports(localforage.INDEXEDDB) && 
        !localforage.supports(localforage.WEBSQL) && 
        !localforage.supports(localforage.LOCALSTORAGE)) {
      return { 
        available: false, 
        message: 'Your browser does not support any storage mechanism required by this application.'
      };
    }
    
    // Try to estimate available space (this is an approximation)
    // We'll use a test write to check if storage is working
    const testKey = `storage-test-${Date.now()}`;
    await localforage.setItem(testKey, 'test');
    await localforage.removeItem(testKey);
    
    return { available: true, message: 'Storage is available' };
  } catch (error) {
    console.error('Storage availability check failed:', error);
    return { 
      available: false, 
      message: 'Unable to access browser storage. You may have reached storage limits or blocked permissions.'
    };
  }
};

// Save document to storage
export const saveDocument = async (document: Document): Promise<void> => {
  // Check document size
  if (document.size > MAX_DOCUMENT_SIZE) {
    throw new Error(`Document size exceeds the maximum limit of 10MB`);
  }
  
  // Check storage availability
  const storageStatus = await checkStorageAvailability();
  if (!storageStatus.available) {
    throw new Error(storageStatus.message);
  }
  
  try {
    // Create a serializable version of the document (convert Date to ISO string)
    const serializableDocument = {
      ...document,
      dateAdded: document.dateAdded.toISOString()
    };
    
    await stores[document.category].setItem(document.id, serializableDocument);
  } catch (error) {
    console.error('Error saving document:', error);
    throw new Error('Failed to save document. You may have reached your browser storage limit.');
  }
};

// Get document by ID and category
export const getDocument = async (id: string, category: DocumentCategory): Promise<Document | null> => {
  try {
    const doc = await stores[category].getItem(id) as any;
    
    if (!doc) return null;
    
    // Ensure doc is a valid document
    if (doc && typeof doc === 'object' && 'id' in doc && 'category' in doc && 'name' in doc && 'content' in doc && 'dateAdded' in doc && 'size' in doc) {
      // Convert ISO date string back to Date object if needed
      if (typeof doc.dateAdded === 'string') {
        return {
          id: doc.id,
          category: doc.category,
          name: doc.name,
          content: doc.content,
          dateAdded: new Date(doc.dateAdded),
          size: doc.size
        };
      }
      
      return doc as Document;
    }
    
    return null;
  } catch (error) {
    console.error(`Error retrieving document ${id}:`, error);
    return null;
  }
};

// Get all documents for a category
export const getAllDocuments = async (category: DocumentCategory): Promise<Document[]> => {
  const documents: Document[] = [];
  
  try {
    await stores[category].iterate((value: any) => {
      // Ensure value is a valid document before processing
      if (value && typeof value === 'object' && 'id' in value && 'category' in value && 'name' in value && 'content' in value && 'dateAdded' in value && 'size' in value) {
        // Convert ISO date string back to Date object if needed
        if (typeof value.dateAdded === 'string') {
          documents.push({
            id: value.id,
            category: value.category,
            name: value.name,
            content: value.content,
            dateAdded: new Date(value.dateAdded),
            size: value.size
          });
        } else {
          documents.push(value as Document);
        }
      }
    });
    
    return documents;
  } catch (error) {
    console.error(`Error retrieving documents for category ${category}:`, error);
    return [];
  }
};

// Delete document
export const deleteDocument = async (id: string, category: DocumentCategory): Promise<void> => {
  await stores[category].removeItem(id);
};

// Get all documents across all categories for context
export const getAllDocumentsForContext = async (): Promise<Document[]> => {
  const allDocuments: Document[] = [];
  
  for (const category of Object.values(DocumentCategory)) {
    const docs = await getAllDocuments(category as DocumentCategory);
    allDocuments.push(...docs);
  }
  
  return allDocuments;
};

// Get total size of all documents
export const getTotalDocumentSize = async (): Promise<number> => {
  const allDocuments = await getAllDocumentsForContext();
  return allDocuments.reduce((total, doc) => total + doc.size, 0);
};
