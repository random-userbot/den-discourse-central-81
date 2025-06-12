import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { postService, getImageUrl } from "@/services/api";
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
  showCommentsText?: boolean;
}

const PostCard = ({ post, denCreatorId, onDelete, showDenInfo = false, showCommentsText = false }: PostCardProps) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [currentVoteCount, setCurrentVoteCount] = useState(post.voteCount);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processedImageUrls, setProcessedImageUrls] = useState<string[]>([]);
  
  useEffect(() => {
    if (post.imageUrls && post.imageUrls.length > 0) {
      setProcessedImageUrls(post.imageUrls.map(url => getImageUrl(url)));
    }
  }, [post.imageUrls]);
  
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
      setCurrentVoteCount(prev => upvote ? prev + 1 : prev - 1);
      
      const response = await postService.votePost(post.id, upvote);
      setCurrentVoteCount(response.data.voteCount);
      
      toast({
        title: "Vote recorded",
        description: upvote ? "Post upvoted successfully" : "Post downvoted successfully",
      });
    } catch (error) {
      setCurrentVoteCount(post.voteCount);
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to register your vote",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const nextImage = () => {
    if (processedImageUrls.length <= 1) return;
    setCurrentImageIndex(prev => (prev + 1) % processedImageUrls.length);
  };
  
  const prevImage = () => {
    if (processedImageUrls.length <= 1) return;
    setCurrentImageIndex(prev => (prev - 1 + processedImageUrls.length) % processedImageUrls.length);
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/post/${post.id}`} className="text-lg font-semibold hover:text-den line-clamp-2">
              {post.title}
            </Link>
            <div className="flex items-center text-muted-foreground text-xs">
              <Link to={`/profile/${post.userId}`} className="hover:underline">
                {post.username}
              </Link>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              {showDenInfo && (
                <>
                  <span className="mx-1">•</span>
                  <Link to={`/den/${post.denId}`} className="hover:underline">
                    {post.denTitle}
                  </Link>
                </>
              )}
            </div>
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
                    This action cannot be undone. This will permanently delete this post and all comments.
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">
          <p className="line-clamp-3">{post.content}</p>
        </div>
        
        {processedImageUrls.length > 0 && (
          <div className="relative mb-4">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              <img 
                src={processedImageUrls[currentImageIndex]} 
                alt={`Post image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {processedImageUrls.length > 1 && (
                <>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-80 h-8 w-8"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-80 h-8 w-8"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {processedImageUrls.map((_, index) => (
                      <div 
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/50'
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
      <CardFooter className="flex justify-between py-2">
        <div className="flex items-center space-x-4">
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
          
          <Link 
            to={`/post/${post.id}`} 
            className="flex items-center space-x-1 text-muted-foreground hover:text-den"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{showCommentsText ? 'Comments' : (typeof post.commentCount === 'number' ? post.commentCount : '–')}</span>
          </Link>
        </div>
        
        <Link to={`/post/${post.id}`} className="text-xs text-den hover:underline">
          View Post
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
