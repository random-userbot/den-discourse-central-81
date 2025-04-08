
import { useState, useContext } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Loader2, ImageIcon, X } from "lucide-react";
import { denService, postService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";
import { useEffect } from "react";

const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .min(5, "Content must be at least 5 characters")
    .max(5000, "Content must be less than 5000 characters"),
  imageUrls: z.array(z.string().url("Invalid URL")).optional(),
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

const CreatePost = () => {
  const { denId } = useParams<{ denId: string }>();
  const [den, setDen] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDen, setIsLoadingDen] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

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
          description: "Failed to load den. Please try again later.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoadingDen(false);
      }
    };

    if (denId) {
      fetchDen();
    }
  }, [denId, toast, navigate]);

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrls: [],
    },
  });

  const onSubmit = async (data: CreatePostFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      const postData = {
        title: data.title,
        content: data.content,
        denId: Number(denId),
        imageUrls: imageUrls,
      };
      
      const response = await postService.createPost(postData);
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      navigate(`/post/${response.data.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create post. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    
    try {
      // Simple URL validation
      new URL(imageUrlInput);
      setImageUrls([...imageUrls, imageUrlInput]);
      setImageUrlInput("");
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };

  const removeImageUrl = (index: number) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls.splice(index, 1);
    setImageUrls(updatedImageUrls);
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (isLoadingDen) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!den) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Den Not Found</h2>
        <p className="text-muted-foreground mb-4">The den you're trying to post in doesn't exist.</p>
        <Link to="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/den/${denId}`}>d/{den.title}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink className="font-semibold">Create Post</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="bg-card shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create a New Post in d/{den.title}</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter post content"
                      {...field}
                      className="min-h-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Images (optional)</FormLabel>
              <div className="flex mt-1 mb-2">
                <Input
                  placeholder="Enter image URL"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 mr-2"
                />
                <Button 
                  type="button" 
                  onClick={addImageUrl}
                  disabled={!imageUrlInput.trim()}
                >
                  Add
                </Button>
              </div>
              <FormDescription>
                You can add multiple images to your post
              </FormDescription>
              
              {imageUrls.length > 0 && (
                <div className="mt-4 space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-1 text-sm truncate text-muted-foreground flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {url}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImageUrl(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/den/${denId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Post
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePost;
