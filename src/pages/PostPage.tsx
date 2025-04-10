
import { useParams, Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postService, commentService, getImageUrl } from "@/services/api";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CommentCard from "@/components/CommentCard";
import { 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  MessageSquare, 
  X, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
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

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentVoteCount, setCurrentVoteCount] = useState<number>(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processedImageUrls, setProcessedImageUrls] = useState<string[]>([]);
  
  const { 
    data: postData, 
    isLoading: isLoadingPost, 
    error: postError,
    refetch: refetchPost
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPostById(Number(postId)),
  });
  
  const { 
    data: commentsData, 
    isLoading: isLoadingComments, 
    refetch: refetchComments 
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentService.getCommentsByPost(Number(postId)),
  });
  
  useEffect(() => {
    if (postData) {
      setCurrentVoteCount(postData.data.voteCount);
      
      if (postData.data.imageUrls && postData.data.imageUrls.length > 0) {
        setProcessedImageUrls(postData.data.imageUrls.map((url: string) => getImageUrl(url)));
      }
    }
  }, [postData]);
  
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
      
      const response = await postService.votePost(Number(postId), upvote);
      setCurrentVoteCount(response.data.voteCount);
      
      toast({
        title: "Vote recorded",
        description: upvote ? "Post upvoted successfully" : "Post downvoted successfully",
        duration: 2000,
      });
    } catch (error) {
      if (postData) {
        setCurrentVoteCount(postData.data.voteCount);
      }
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
  
  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to comment",
      });
      return;
    }
    
    if (!commentContent.trim() || isSubmittingComment) return;
    
    try {
      setIsSubmittingComment(true);
      
      await commentService.createComment({
        content: commentContent,
        postId: Number(postId),
      });
      
      setCommentContent("");
      refetchComments();
      
      toast({
        title: "Success",
        description: "Comment submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleDeletePost = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await postService.deletePost(Number(postId));
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      navigate(-1);
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
  
  const handleReplySubmit = async (commentData: { content: string; postId: number; parentCommentId?: number }) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to reply to comments",
      });
      throw new Error("Authentication required");
    }
    
    try {
      const response = await commentService.createComment(commentData);
      toast({
        title: "Success",
        description: "Reply submitted successfully",
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "Failed to submit reply",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleCommentDelete = () => {
    refetchComments();
  };
  
  const nextImage = () => {
    if (processedImageUrls.length <= 1) return;
    setCurrentImageIndex(prev => (prev + 1) % processedImageUrls.length);
  };
  
  const prevImage = () => {
    if (processedImageUrls.length <= 1) return;
    setCurrentImageIndex(prev => (prev - 1 + processedImageUrls.length) % processedImageUrls.length);
  };
  
  if (isLoadingPost) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (postError || !postData) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="text-muted-foreground mt-2">The post you are looking for may have been removed or doesn't exist.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/")}
        >
          Go Home
        </Button>
      </div>
    );
  }
  
  const post = postData.data;
  const canDelete = user && (user.id === post.userId || user.id === post.denCreatorId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to={`/den/${post.denId}`} className="flex items-center text-sm text-muted-foreground hover:text-den">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {post.denTitle}
        </Link>
      </div>
    
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <Link to={`/profile/${post.userId}`} className="hover:underline">
                  {post.username}
                </Link>
                <span className="mx-1">•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <span className="mx-1">•</span>
                <Link to={`/den/${post.denId}`} className="hover:underline">
                  {post.denTitle}
                </Link>
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
                      onClick={handleDeletePost}
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
          <div className="mb-6 text-base">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>
          
          {processedImageUrls.length > 0 && (
            <div className="relative mb-6">
              <div className="relative bg-muted rounded-md overflow-hidden">
                <img 
                  src={processedImageUrls[currentImageIndex]} 
                  alt={`Post image ${currentImageIndex + 1}`}
                  className="w-full max-h-[60vh] object-contain mx-auto"
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
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">
                {commentsData?.data.length || 0} {commentsData?.data.length === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Comments</h3>
        
        {user ? (
          <div className="relative mb-4">
            <Textarea
              placeholder="Write your comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="min-h-32"
            />
            {commentContent && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => setCommentContent("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!commentContent.trim() || isSubmittingComment}
              >
                {isSubmittingComment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Comment
              </Button>
            </div>
          </div>
        ) : (
          <Card className="mb-4 bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground mb-2">You need to be logged in to comment</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoadingComments ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : commentsData && commentsData.data.length > 0 ? (
          <div className="space-y-4">
            {commentsData.data.map((comment: any) => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                denCreatorId={post.denCreatorId}
                onDelete={handleCommentDelete}
                onReplySubmit={handleReplySubmit}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PostPage;
