
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageSquare, Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { postService } from "@/services/api";
import { AuthContext } from "@/context/AuthContext";
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
import { useToast } from "@/components/ui/use-toast";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    username: string;
    userId: number;
    denId: number;
    denTitle: string;
    createdAt: string;
    voteCount: number;
    commentCount?: number;
    imageUrls?: string[];
  };
  denCreatorId?: number;
  onDelete?: () => void;
  showDenInfo?: boolean;
}

const PostCard = ({ post, denCreatorId, onDelete, showDenInfo = false }: PostCardProps) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [currentVoteCount, setCurrentVoteCount] = useState(post.voteCount);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const canDelete = user && (user.id === post.userId || user.id === denCreatorId);
  
  const handleVote = async (upvote: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to vote on posts",
      });
      return;
    }
    
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      // Optimistic update
      setCurrentVoteCount(prev => upvote ? prev + 1 : prev - 1);
      
      const response = await postService.votePost(post.id, upvote);
      // Update with actual count from server
      setCurrentVoteCount(response.data.voteCount);
    } catch (error) {
      // Revert on error
      setCurrentVoteCount(post.voteCount);
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await postService.deletePost(post.id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const truncatedContent = post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;

  return (
    <Card className="mb-4 hover:shadow-sm transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <Link to={`/post/${post.id}`} className="hover:text-den">
            <h3 className="text-lg font-semibold">{post.title}</h3>
          </Link>
          <div className="flex flex-wrap items-center text-muted-foreground text-xs mt-1">
            <span>Posted by{" "}
              <Link to={`/profile/${post.userId}`} className="text-den hover:underline">
                {post.username}
              </Link>
            </span>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            
            {showDenInfo && (
              <>
                <span className="mx-1">•</span>
                <Link to={`/den/${post.denId}`} className="hover:underline">
                  <Badge variant="outline" className="text-xs">
                    d/{post.denTitle}
                  </Badge>
                </Link>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm">{truncatedContent}</p>
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            <img 
              src={post.imageUrls[0]} 
              alt="Post image" 
              className="rounded-md max-h-60 object-cover"
            />
            {post.imageUrls.length > 1 && (
              <p className="text-xs text-muted-foreground">
                +{post.imageUrls.length - 1} more {post.imageUrls.length === 2 ? 'image' : 'images'}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-den"
              onClick={() => handleVote(true)}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{currentVoteCount}</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-den"
              onClick={() => handleVote(false)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          
          <Link to={`/post/${post.id}`} className="text-muted-foreground hover:text-den">
            <Button size="sm" variant="ghost" className="space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{post.commentCount || 0}</span>
            </Button>
          </Link>
        </div>
        
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the post
                  and all associated comments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
