import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { postService, commentService, getImageUrl } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { Home, Loader2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import CommentCard from "@/components/CommentCard";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentReplies, setCommentReplies] = useState<{ [key: number]: any[] }>({});
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoadingPost(true);
        const response = await postService.getPostById(Number(postId));
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPost(false);
      }
    };

    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        const response = await commentService.getCommentsByPost(Number(postId));
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId, toast]);

  useEffect(() => {
    if (post && post.imageUrls && post.imageUrls.length > 0) {
      const processedUrls = post.imageUrls.map((url: string) => getImageUrl(url));
      setPost({
        ...post,
        processedImageUrls: processedUrls
      });
    }
  }, [post?.imageUrls]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;
    
    try {
      setIsSubmittingComment(true);
      
      const response = await commentService.createComment({
        content: newComment,
        postId: Number(postId),
      });
      
      setComments([response.data, ...comments]);
      setNewComment("");
      
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const fetchReplies = async (commentId: number) => {
    try {
      const response = await commentService.getReplies(commentId);
      setCommentReplies((prev) => ({
        ...prev,
        [commentId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };
  
  const handleReplySubmit = async (commentData: { content: string; postId: number; parentCommentId?: number }) => {
    try {
      const response = await commentService.createComment(commentData);
      
      if (commentData.parentCommentId && commentReplies[commentData.parentCommentId]) {
        setCommentReplies((prev) => ({
          ...prev,
          [commentData.parentCommentId!]: [
            response.data,
            ...(prev[commentData.parentCommentId!] || []),
          ],
        }));
      }
      
      if (commentData.parentCommentId) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentData.parentCommentId
              ? { ...comment, hasReplies: true }
              : comment
          )
        );
      }
      
      return response.data;
    } catch (error) {
      console.error("Error submitting reply:", error);
      throw error;
    }
  };
  
  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    
    if (commentReplies[commentId]) {
      const newReplies = { ...commentReplies };
      delete newReplies[commentId];
      setCommentReplies(newReplies);
    }
  };
  
  const handleDeleteReply = (parentCommentId: number, replyId: number) => {
    if (commentReplies[parentCommentId]) {
      const updatedReplies = commentReplies[parentCommentId].filter(
        (reply) => reply.id !== replyId
      );
      
      setCommentReplies({
        ...commentReplies,
        [parentCommentId]: updatedReplies,
      });
      
      if (updatedReplies.length === 0) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentCommentId
              ? { ...comment, hasReplies: false }
              : comment
          )
        );
      }
    }
  };
  
  const handleDeletePost = () => {
    if (post?.denId) {
      navigate(`/den/${post.denId}`);
    } else {
      navigate('/');
    }
  };

  if (isLoadingPost) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
        <Link to="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card shadow-sm rounded-lg p-4 mb-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/den/${post.denId}`}>d/{post.denTitle}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="mb-6">
        <PostCard 
          post={post} 
          showDenInfo={true} 
          onDelete={handleDeletePost}
          denCreatorId={post.denCreatorId}
        />
      </div>

      <div className="bg-card shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Comments</h2>
        
        {isAuthenticated ? (
          <div className="mb-8">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-24"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmittingComment}
              >
                {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-8 text-center p-4 bg-muted rounded-md">
            <p className="mb-2">Sign in to join the conversation</p>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
          </div>
        )}
        
        {isLoadingComments ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id}>
                <CommentCard 
                  comment={comment}
                  denCreatorId={post.denCreatorId}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onReplySubmit={handleReplySubmit}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;
