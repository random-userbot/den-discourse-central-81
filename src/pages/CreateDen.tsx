
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
import { Home, Loader2, Plus, Users, ImageIcon, Type, FileText } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Breadcrumb className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-semibold text-gray-700 dark:text-gray-300">Create Den</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-glow">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">
              Create Your Den
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Build a community around your interests and bring people together
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-gray-700/30"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Alert variant="destructive" className="bg-red-50 border-red-200 shadow-lg">
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-semibold text-lg flex items-center">
                      <Type className="w-5 h-5 mr-2 text-blue-500" />
                      Den Title
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter den title (e.g., technology, gaming, music)" 
                        className="h-12 text-lg rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-300"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                      <span className="font-medium">Preview:</span> d/{field.value || "example"}
                      <br />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Only letters, numbers, dashes, and underscores allowed</span>
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
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-semibold text-lg flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-500" />
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what your den is about and what kind of discussions you want to foster..."
                        className="min-h-32 text-lg rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-300 resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                      Help potential members understand what your community is about
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
                    <FormLabel className="text-gray-700 dark:text-gray-200 font-semibold text-lg flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2 text-pink-500" />
                      Banner Image URL (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        className="h-12 text-lg rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-300"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-xl border border-pink-200 dark:border-pink-800">
                      Add a visual banner to make your den more appealing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1 h-12 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Den...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5" />
                      Create Den
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateDen;
