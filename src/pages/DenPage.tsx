
import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { denService, postService } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Plus, Home, Loader2, Users, MessageSquare, Calendar, Edit3 } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading den...</p>
        </div>
      </div>
    );
  }

  if (!den) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Den Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The den you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
              <BreadcrumbLink className="font-semibold text-gray-700 dark:text-gray-300">
                d/{den.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </motion.div>

        {/* Den Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden mb-8"
        >
          {den.imageUrl && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img 
                src={den.imageUrl}
                alt={den.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  d/{den.title}
                </h1>
                {den.description && (
                  <p className="text-lg text-white/90 drop-shadow-md max-w-2xl">
                    {den.description}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="p-8">
            {!den.imageUrl && (
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
                  d/{den.title}
                </h1>
                {den.description && (
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    {den.description}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="font-medium">Created by {den.creatorUsername}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  <span>{formatDistanceToNow(new Date(den.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                  <span>{posts.length} posts</span>
                </div>
              </div>
              
              {isAuthenticated && (
                <Button 
                  onClick={() => navigate(`/create-post/${denId}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Create Post
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-blue-500" />
              Recent Posts
            </h2>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          
          {isLoadingPosts ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading posts...</p>
              </div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="transform hover:scale-[1.01] transition-transform duration-300"
                >
                  <PostCard 
                    post={post}
                    denCreatorId={den.creatorId}
                    onDelete={() => handleDeletePost(post.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit3 className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to start a discussion in this den!</p>
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate(`/create-post/${denId}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create the first post
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign in to post
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DenPage;
