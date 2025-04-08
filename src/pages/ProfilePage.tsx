
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { userService } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon } from "lucide-react";
import PostCard from "@/components/PostCard";
import CommentCard from "@/components/CommentCard";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useContext(AuthContext);
  const isOwnProfile = currentUser?.id === Number(userId);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await userService.getUserProfile(Number(userId));
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchUserHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await userService.getUserHistory(Number(userId));
        setUserHistory(response.data);
      } catch (error) {
        console.error("Error fetching user history:", error);
        toast({
          title: "Error",
          description: "Failed to load user history. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (userId) {
      fetchUserProfile();
      fetchUserHistory();
    }
  }, [userId, toast]);

  const handlePostDelete = (postId: number) => {
    if (userHistory) {
      setUserHistory({
        ...userHistory,
        posts: userHistory.posts.filter((post: any) => post.id !== postId),
      });
    }
  };

  const handleCommentDelete = (commentId: number) => {
    if (userHistory) {
      setUserHistory({
        ...userHistory,
        comments: userHistory.comments.filter((comment: any) => comment.id !== commentId),
      });
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="bg-card shadow-sm rounded-lg p-6">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.username} 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="ml-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {isOwnProfile && (
                  <Badge className="ml-2 bg-den text-den-foreground">You</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">User Activity</h2>
        
        <Tabs defaultValue="posts">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userHistory?.posts && userHistory.posts.length > 0 ? (
              <div className="space-y-4">
                {userHistory.posts.map((post: any) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    showDenInfo={true}
                    onDelete={() => handlePostDelete(post.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="comments">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userHistory?.comments && userHistory.comments.length > 0 ? (
              <div className="space-y-4">
                {userHistory.comments.map((comment: any) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="mb-2 text-xs">
                      <span className="text-muted-foreground">Posted in </span>
                      <a 
                        href={`/post/${comment.postId}`} 
                        className="font-medium hover:underline"
                      >
                        {comment.postTitle}
                      </a>
                      <span className="text-muted-foreground"> in </span>
                      <a 
                        href={`/den/${comment.denId}`} 
                        className="font-medium hover:underline"
                      >
                        d/{comment.denTitle}
                      </a>
                    </div>
                    <CommentCard 
                      comment={comment} 
                      onDelete={() => handleCommentDelete(comment.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
