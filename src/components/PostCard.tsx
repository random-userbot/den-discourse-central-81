
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { postService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Calendar,
  User,
  Trash2,
  Edit,
  ImageIcon,
  ExternalLink
} from "lucide-react";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    images?: string[];
    creatorUsername: string;
    creatorId: number;
    denTitle: string;
    denId: number;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    commentCount: number;
    userVote?: "upvote" | "downvote" | null;
  };
  denCreatorId?: number;
  onDelete?: () => void;
}

const PostCard = ({ post, denCreatorId, onDelete }: PostCardProps) => {
  const [currentVote, setCurrentVote] = useState(post.userVote);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      await postService.votePost(post.id, { voteType });
      
      if (currentVote === voteType) {
        setCurrentVote(null);
        if (voteType === "upvote") {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
      } else {
        if (currentVote && currentVote !== voteType) {
          if (currentVote === "upvote") {
            setUpvotes(upvotes - 1);
          } else {
            setDownvotes(downvotes - 1);
          }
        }
        
        setCurrentVote(voteType);
        if (voteType === "upvote") {
          setUpvotes(currentVote ? upvotes + 1 : upvotes + 1);
        } else {
          setDownvotes(currentVote ? downvotes + 1 : downvotes + 1);
        }
      }
      
      toast({
        title: "Vote recorded",
        description: `Your ${voteType} has been recorded`,
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleDelete = async () => {
    if (!user || (user.username !== post.creatorUsername && user.id !== denCreatorId)) {
      return;
    }

    try {
      await postService.deletePost(post.id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const canDelete = user && (user.username === post.creatorUsername || user.id === denCreatorId);

  return (
    <Card className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              <Link to={`/post/${post.id}`} className="hover:text-gray-700 transition-colors">
                {post.title}
              </Link>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium">{post.creatorUsername}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>in</span>
                <Link 
                  to={`/den/${post.denId}`}
                  className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                >
                  d/{post.denTitle}
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {post.content && (
          <p className="text-gray-800 mb-4 leading-relaxed">
            {post.content}
          </p>
        )}

        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className="relative bg-gray-100 rounded border">
              <img
                src={post.images[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                className="w-full h-64 object-cover rounded"
              />
              {post.images.length > 1 && (
                <>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {post.images.length}
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {post.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("upvote")}
                className={`p-1 h-8 w-8 ${
                  currentVote === "upvote" 
                    ? "text-green-600 bg-green-50" 
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                {upvotes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("downvote")}
                className={`p-1 h-8 w-8 ${
                  currentVote === "downvote" 
                    ? "text-red-600 bg-red-50" 
                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                {downvotes}
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">{post.commentCount}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/post/${post.id}`)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Post
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
