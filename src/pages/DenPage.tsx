import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { denService, postService } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Plus, Home, Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";

const DenPage = () => {
  const { denId } = useParams<{ denId: string }>();
  const [den, setDen] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingDen, setIsLoadingDen] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
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
      } finally {
        setIsLoadingDen(false);
      }
    };

    const fetchPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const response = await postService.getPostsByDen(Number(denId));
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    if (denId) {
      fetchDen();
      fetchPosts();
    }
  }, [denId, toast]);

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

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
        <p className="text-muted-foreground mb-4">The den you're looking for doesn't exist.</p>
        <Link to="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
     

      <div className="bg-card shadow-sm rounded-lg overflow-hidden mb-8">
        {den.imageUrl && (
          <div className="w-full h-72 overflow-hidden">
            <img 
              src={den.imageUrl}
              alt={den.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">d/{den.title}</h1>
              {den.description && <p className="text-muted-foreground mt-1">{den.description}</p>}
            </div>
            
            {isAuthenticated && (
              <Button 
                onClick={() => navigate(`/create-post/${denId}`)}
                className="bg-den hover:bg-den-accent whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Posts</h2>
        <div className="divide-y">
          {isLoadingPosts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="py-4 first:pt-0 last:pb-0">
                  <PostCard 
                    post={post}
                    denCreatorId={den.creatorId}
                    onDelete={() => handleDeletePost(post.id)}
                    showCommentsText={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No posts in this den yet.</p>
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate(`/create-post/${denId}`)}
                  variant="outline"
                >
                  Create the first post
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                >
                  Sign in to post
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DenPage;
