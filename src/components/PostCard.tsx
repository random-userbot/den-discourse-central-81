
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Share2,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  Hash,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { postService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    images?: string[];
    upvotes: number;
    downvotes: number;
    username: string;
    userId: number;
    createdAt: string;
    denTitle?: string;
    denId?: number;
    commentCount?: number;
    userVote?: "UP" | "DOWN" | null;
  };
  showDenInfo?: boolean;
  denCreatorId?: number;
  onDelete?: () => void;
}

const PostCard = ({ post, showDenInfo = false, denCreatorId, onDelete }: PostCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [votes, setVotes] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    userVote: post.userVote,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const canDelete = user && (user.id === post.userId || user.id === denCreatorId);
  const netVotes = votes.upvotes - votes.downvotes;

  const handleVote = async (voteType: "UP" | "DOWN") => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const isCurrentVote = votes.userVote === voteType;
      const newVoteType = isCurrentVote ? null : voteType;

      await postService.voteOnPost(post.id, newVoteType);

      setVotes(prev => {
        let newUpvotes = prev.upvotes;
        let newDownvotes = prev.downvotes;

        // Remove previous vote
        if (prev.userVote === "UP") newUpvotes--;
        if (prev.userVote === "DOWN") newDownvotes--;

        // Add new vote
        if (newVoteType === "UP") newUpvotes++;
        if (newVoteType === "DOWN") newDownvotes++;

        return {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newVoteType,
        };
      });
    } catch (error) {
      console.error("Error voting on post:", error);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await postService.deletePost(post.id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      onDelete?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const nextImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images!.length);
    }
  };

  const prevImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + post.images!.length) % post.images!.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link 
                to={`/post/${post.id}`}
                className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2 mb-3 leading-tight">
                  {post.title}
                </h3>
              </Link>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-blue-500" />
                  <span className="font-medium">{post.username}</span>
                </div>
                
                {showDenInfo && post.denTitle && (
                  <Link 
                    to={`/den/${post.denId}`}
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Hash className="w-4 h-4 mr-1.5 text-purple-500" />
                    <span className="font-medium">d/{post.denTitle}</span>
                  </Link>
                )}
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-green-500" />
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this post? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600 rounded-xl"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>

        <CardContent className="py-0">
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
            {post.content}
          </p>

          {post.images && post.images.length > 0 && (
            <div className="relative mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={post.images[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              
              {post.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                    {currentImageIndex + 1} / {post.images.length}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Voting */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("UP")}
                className={`rounded-full w-8 h-8 p-0 transition-all duration-300 ${
                  votes.userVote === "UP"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              
              <span className={`px-3 py-1 text-sm font-semibold min-w-[3rem] text-center ${
                netVotes > 0 ? "text-green-600 dark:text-green-400" :
                netVotes < 0 ? "text-red-600 dark:text-red-400" :
                "text-gray-600 dark:text-gray-400"
              }`}>
                {netVotes > 0 ? `+${netVotes}` : netVotes}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("DOWN")}
                className={`rounded-full w-8 h-8 p-0 transition-all duration-300 ${
                  votes.userVote === "DOWN"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments */}
            <Link to={`/post/${post.id}`}>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{post.commentCount || 0}</span>
              </Button>
            </Link>

            {/* Share */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
                toast({ title: "Link copied to clipboard!" });
              }}
              className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Link to={`/post/${post.id}`}>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Post
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PostCard;
