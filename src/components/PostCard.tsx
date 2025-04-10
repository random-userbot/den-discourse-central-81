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
}

const PostCard = ({ post, denCreatorId, onDelete, showDenInfo = false }: PostCardProps) => {
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
        description: "Failed to register your vote. Please try again.",
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
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (processedImageUrls && processedImageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? processedImageUrls.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (processedImageUrls && processedImageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === processedImageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const truncatedContent = post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow w-full">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="w-full">
          <Link to={`/post/${post.id}`} className="hover:text-den">
            <h3 className="text-xl font-semibold">{post.title}</h3>
          </Link>
          <div className="flex flex-wrap items-center text-muted-foreground text-sm mt-1">
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
        <p className="text-base">{truncatedContent}</p>
        {processedImageUrls && processedImageUrls.length > 0 && (
          <div className="mt-4 relative">
            <Link to={`/post/${post.id}`} className="block">
              <img 
                src={processedImageUrls[currentImageIndex]} 
                alt={`Post image ${currentImageIndex + 1}`}
                className="rounded-md max-h-80 w-full object-cover"
                onError={(e) => {
                  console.log("Image failed to load:", processedImageUrls[currentImageIndex]);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
            
            {processedImageUrls.length > 1 && (
              <>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="bg-background/70 text-foreground px-2 py-1 rounded-md text-xs">
                    {currentImageIndex + 1} of {processedImageUrls.length}
                  </span>
                </div>
              </>
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
              <MessageSquare className="h-4 w-4 mr-1" />
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
