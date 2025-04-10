
import { useContext, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import { commentService } from "@/services/api";
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
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommentCardProps {
  comment: {
    id: number;
    content: string;
    userId: number;
    username: string;
    postId: number;
    parentCommentId?: number;
    createdAt: string;
    voteCount: number;
    hasReplies?: boolean;
  };
  denCreatorId?: number;
  onDelete?: () => void;
  onReplySubmit?: (commentData: { content: string; postId: number; parentCommentId?: number }) => Promise<any>;
  depth?: number;
}

const CommentCard = ({ 
  comment, 
  denCreatorId, 
  onDelete, 
  onReplySubmit,
  depth = 0
}: CommentCardProps) => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [currentVoteCount, setCurrentVoteCount] = useState(comment.voteCount);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const canDelete = user && (user.id === comment.userId || user.id === denCreatorId);
  
  useEffect(() => {
    if (comment.hasReplies && !repliesLoaded && showReplies) {
      fetchReplies();
    }
  }, [comment.hasReplies, showReplies]);
  
  const handleVote = async (upvote: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to vote on comments",
      });
      return;
    }
    
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      setCurrentVoteCount(prev => upvote ? prev + 1 : prev - 1);
      
      const response = await commentService.voteComment(comment.id, upvote);
      setCurrentVoteCount(response.data.voteCount);
      
      toast({
        title: "Vote recorded",
        description: upvote ? "Comment upvoted successfully" : "Comment downvoted successfully",
        duration: 2000,
      });
    } catch (error) {
      setCurrentVoteCount(comment.voteCount);
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
      await commentService.deleteComment(comment.id);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleSubmitReply = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to reply to comments",
      });
      return;
    }
    
    if (!replyContent.trim() || isSubmittingReply) return;
    
    try {
      setIsSubmittingReply(true);
      
      const commentData = {
        content: replyContent,
        postId: comment.postId,
        parentCommentId: comment.id,
      };
      
      if (onReplySubmit) {
        const newReply = await onReplySubmit(commentData);
        setReplies(prev => [newReply, ...prev]);
        if (!showReplies) setShowReplies(true);
      } else {
        const response = await commentService.createComment(commentData);
        setReplies(prev => [response.data, ...prev]);
        if (!showReplies) setShowReplies(true);
      }
      
      setReplyContent("");
      setShowReplyForm(false);
      
      toast({
        title: "Success",
        description: "Reply submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "Failed to submit reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };
  
  const fetchReplies = async () => {
    if (loadingReplies) return;
    
    try {
      setLoadingReplies(true);
      setLoadError(null);
      const response = await commentService.getReplies(comment.id);
      setReplies(response.data);
      setRepliesLoaded(true);
    } catch (error) {
      console.error("Error fetching replies:", error);
      setLoadError("Failed to load replies. Please try again.");
    } finally {
      setLoadingReplies(false);
    }
  };
  
  const handleDeleteReply = (replyId: number) => {
    setReplies(prev => prev.filter(reply => reply.id !== replyId));
    
    if (replies.length <= 1) {
      // Update local state to reflect that there are no more replies
      comment.hasReplies = false;
    }
  };

  const handleToggleReplies = () => {
    const newShowReplies = !showReplies;
    setShowReplies(newShowReplies);
    
    // If we're showing replies and they haven't been loaded yet, fetch them
    if (newShowReplies && !repliesLoaded && comment.hasReplies) {
      fetchReplies();
    }
  };

  return (
    <Card className={`mb-3 ${depth > 0 ? 'border-l-4 border-l-accent' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-center mb-2">
          <Link to={`/profile/${comment.userId}`} className="text-sm font-medium hover:underline">
            {comment.username}
          </Link>
          <span className="mx-1 text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between py-2">
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
          
          {depth < 3 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground space-x-1 hover:text-den"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
          )}
          
          {(comment.hasReplies || replies.length > 0) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground space-x-1 hover:text-den"
              onClick={handleToggleReplies}
              disabled={loadingReplies}
            >
              {loadingReplies ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : showReplies ? (
                <ChevronUp className="h-4 w-4 mr-1" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-xs">
                {showReplies ? "Hide Replies" : "Show Replies"}
              </span>
            </Button>
          )}
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
                  This action cannot be undone. This will permanently delete this comment
                  and all of its replies.
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
      
      {showReplyForm && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-24"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1"
              onClick={() => setShowReplyForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={handleSubmitReply}
              disabled={!replyContent.trim() || isSubmittingReply}
            >
              {isSubmittingReply ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Submit Reply
            </Button>
          </div>
        </div>
      )}
      
      {showReplies && (
        <div className="ml-6 mt-2 mb-4 px-4">
          {loadError ? (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          ) : loadingReplies ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-2">
              {replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  denCreatorId={denCreatorId}
                  onDelete={() => handleDeleteReply(reply.id)}
                  onReplySubmit={onReplySubmit}
                  depth={depth + 1}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No replies found.
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default CommentCard;
