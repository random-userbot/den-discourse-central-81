import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Home, Loader2 } from "lucide-react";
import { denService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";

const createDenSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be less than 50 characters")
    .refine(value => /^[a-zA-Z0-9_-]+$/.test(value), {
      message: "Title can only contain letters, numbers, dashes, and underscores",
    }),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  imageUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type CreateDenFormValues = z.infer<typeof createDenSchema>;

const CreateDen = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const form = useForm<CreateDenFormValues>({
    resolver: zodResolver(createDenSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data: CreateDenFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      const denData = {
        title: data.title,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
      };
      
      const response = await denService.createDen(denData);
      
      toast({
        title: "Success",
        description: "Den created successfully!",
      });
      
      navigate(`/den/${response.data.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create den. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      
      <div className="bg-card shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create a New Den</h1>
        
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
                    <Input placeholder="Enter den title" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used in the URL as d/{field.value || "example"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter den description"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain what your den is about
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter image URL" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Add a banner image for your den
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Den
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateDen;
