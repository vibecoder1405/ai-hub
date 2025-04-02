import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  DocumentCategory, 
  saveDocument, 
  MAX_DOCUMENT_SIZE 
} from '@/services/documentStorage';

const DocumentUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.Menu);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      if (selectedFile.size > MAX_DOCUMENT_SIZE) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value as DocumentCategory);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const content = await readFileContent(file);
      
      // Create document object
      const document = {
        id: uuidv4(),
        category,
        name: file.name,
        content,
        dateAdded: new Date(),
        size: file.size,
      };
      
      // Save document
      await saveDocument(document);
      
      toast({
        title: 'Document uploaded',
        description: `${file.name} has been uploaded successfully`,
      });
      
      // Reset form
      setFile(null);
      // Use global document object to get the file input element
      const fileInput = window.document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload documents to enhance the chatbot's knowledge. Maximum file size: 10MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Document Category</Label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DocumentCategory.Menu}>Menu</SelectItem>
              <SelectItem value={DocumentCategory.Reviews}>Reviews</SelectItem>
              <SelectItem value={DocumentCategory.FAQs}>FAQs</SelectItem>
              <SelectItem value={DocumentCategory.ChatHistory}>Chat History</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="file-upload">Document</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".txt,.csv,.json,.md"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: .txt, .csv, .json, .md
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploader;
