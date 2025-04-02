import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  DocumentCategory, 
  Document, 
  getAllDocuments, 
  deleteDocument,
  getTotalDocumentSize,
  MAX_DOCUMENT_SIZE
} from '@/services/documentStorage';
import { Trash2, FileText, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

const DocumentManager = () => {
  const [documents, setDocuments] = useState<Record<DocumentCategory, Document[]>>({
    [DocumentCategory.Menu]: [],
    [DocumentCategory.Reviews]: [],
    [DocumentCategory.FAQs]: [],
    [DocumentCategory.ChatHistory]: [],
  });
  const [activeTab, setActiveTab] = useState<DocumentCategory>(DocumentCategory.Menu);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);
  const { toast } = useToast();

  // Load documents
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const menuDocs = await getAllDocuments(DocumentCategory.Menu);
      const reviewsDocs = await getAllDocuments(DocumentCategory.Reviews);
      const faqsDocs = await getAllDocuments(DocumentCategory.FAQs);
      const chatHistoryDocs = await getAllDocuments(DocumentCategory.ChatHistory);
      
      setDocuments({
        [DocumentCategory.Menu]: menuDocs,
        [DocumentCategory.Reviews]: reviewsDocs,
        [DocumentCategory.FAQs]: faqsDocs,
        [DocumentCategory.ChatHistory]: chatHistoryDocs,
      });
      
      // Update total size
      const size = await getTotalDocumentSize();
      setTotalSize(size);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error loading documents',
        description: 'Failed to load documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentCategory);
  };

  // Handle document deletion
  const handleDeleteDocument = async (id: string, category: DocumentCategory) => {
    try {
      await deleteDocument(id, category);
      
      // Update documents list
      await loadDocuments();
      
      toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error deleting document',
        description: 'Failed to delete the document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate storage usage percentage
  const storagePercentage = (totalSize / MAX_DOCUMENT_SIZE) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Manager</CardTitle>
        <CardDescription>
          Manage your uploaded documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Storage Usage</span>
            <span>{formatFileSize(totalSize)} / {formatFileSize(MAX_DOCUMENT_SIZE)}</span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          {storagePercentage > 90 && (
            <div className="flex items-center gap-2 text-amber-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Storage almost full</span>
            </div>
          )}
        </div>
        
        {/* Document tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value={DocumentCategory.Menu}>Menu</TabsTrigger>
            <TabsTrigger value={DocumentCategory.Reviews}>Reviews</TabsTrigger>
            <TabsTrigger value={DocumentCategory.FAQs}>FAQs</TabsTrigger>
            <TabsTrigger value={DocumentCategory.ChatHistory}>Chat History</TabsTrigger>
          </TabsList>
          
          {Object.values(DocumentCategory).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Loading documents...</div>
              ) : documents[category as DocumentCategory].length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No documents in this category
                </div>
              ) : (
                documents[category as DocumentCategory].map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)} • Added {formatDistanceToNow(new Date(doc.dateAdded), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteDocument(doc.id, category as DocumentCategory)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentManager;
