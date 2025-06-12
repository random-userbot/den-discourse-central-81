import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { denService, postService } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Upload, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

const CreatePost = () => {
  const { denId } = useParams<{ denId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [den, setDen] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDen, setIsLoadingDen] = useState(true);
  
  // For file uploads
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    const fetchDen = async () => {
      try {
        setIsLoadingDen(true);
        const response = await denService.getDenById(Number(denId));
        setDen(response.data);
      } catch (error) {
        console.error("Error fetching den:", error);
        toast({
          title: "Error",
          description: "Failed to load den information. You will be redirected to the home page.",
          variant: "destructive",
        });
        // Redirect to home after a brief delay
        setTimeout(() => navigate("/home"), 2000);
      } finally {
        setIsLoadingDen(false);
      }
    };

    if (denId) {
      fetchDen();
    }
  }, [denId, navigate, toast]);
  
  const handleAddImageUrl = () => {
    if (imageUrlInput && !imageUrls.includes(imageUrlInput)) {
      setImageUrls([...imageUrls, imageUrlInput]);
      setImageUrlInput("");
    }
  };
  
  const handleRemoveImageUrl = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
    }
  };
  
  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(selectedFiles.filter(file => file !== fileToRemove));
  };
  
  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      
      const response = await postService.uploadImages(formData);
      return response.data;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload images. Your post will be created without the images.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a title and content for your post.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload files first if there are any
      let allImageUrls = [...imageUrls];
      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadFiles();
        allImageUrls = [...allImageUrls, ...uploadedUrls];
      }
      
      // Create the post
      const postData = {
        title,
        content,
        denId: Number(denId),
        imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined
      };
      
      const response = await postService.createPost(postData);
      
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });
      
      // Navigate to the new post
      navigate(`/post/${response.data.id}`);
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingDen) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Create a Post in d/{den?.title}</CardTitle>
          <CardDescription>Share your thoughts, ask questions, or start a discussion</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your post a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  className="min-h-32"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Images (optional)</Label>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="w-full"
                    />
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">Selected Files:</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <div className="flex items-center">
                            <Image className="h-4 w-4 mr-2" />
                            <span className="text-sm truncate" style={{maxWidth: '250px'}}>{file.name}</span>
                          </div>
                          <Button 
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFile(file)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <Label>Image URLs (optional)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="url"
                    placeholder="Enter image URL"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleAddImageUrl}
                  >
                    Add
                  </Button>
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Image URLs:</p>
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm truncate" style={{maxWidth: '300px'}}>{url}</span>
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveImageUrl(url)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/den/${denId}`)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isUploading || !title.trim() || !content.trim()}
          >
            {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading Images...' : isSubmitting ? 'Creating Post...' : 'Create Post'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePost;
