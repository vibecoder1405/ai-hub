
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/FileUploader';

const Settings = () => {
  const [restaurantName, setRestaurantName] = useState('Taste of India');
  const [restaurantLogo, setRestaurantLogo] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D');

  const handleLogoChange = (logoUrl: string) => {
    setRestaurantLogo(logoUrl);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
              <CardDescription>
                Update your restaurant's name, logo, and other basic information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input 
                    id="name" 
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Restaurant Logo</Label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-md overflow-hidden border">
                      {restaurantLogo ? (
                        <img 
                          src={restaurantLogo} 
                          alt="Restaurant Logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Logo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <FileUploader onFileUpload={handleLogoChange} />
                    </div>
                  </div>
                </div>
                
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Content</CardTitle>
              <CardDescription>
                Upload files for each category to train your chatbot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="menu">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                  <TabsTrigger value="chat">Chat History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="menu" className="mt-4 space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Menu Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload menu items, descriptions, prices, etc. Supported formats: .csv, .xlsx, .json
                    </p>
                    <FileUploader />
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-4 space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Reviews Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload customer reviews, ratings, etc. Supported formats: .csv, .xlsx, .json
                    </p>
                    <FileUploader />
                  </div>
                </TabsContent>
                
                <TabsContent value="faqs" className="mt-4 space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">FAQs Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload frequently asked questions and answers. Supported formats: .csv, .xlsx, .json
                    </p>
                    <FileUploader />
                  </div>
                </TabsContent>
                
                <TabsContent value="chat" className="mt-4 space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Chat History Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload past chat conversations. Supported formats: .csv, .xlsx, .json
                    </p>
                    <FileUploader />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
