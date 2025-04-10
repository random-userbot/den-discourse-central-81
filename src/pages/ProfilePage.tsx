
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { userService, postService, commentService } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, Trash2, Pencil, X, CheckCircle2 } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser, updateCurrentUser } = useContext(AuthContext);
  const isOwnProfile = currentUser?.id === Number(userId);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await userService.getUserProfile(Number(userId));
        setProfile(response.data);
        setBioText(response.data.bio || "");
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

  const handlePostDelete = async (postId: number) => {
    try {
      await postService.deletePost(postId);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      setUserHistory({
        ...userHistory,
        posts: userHistory.posts.filter((post: any) => post.id !== postId),
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      setUserHistory({
        ...userHistory,
        comments: userHistory.comments.filter((comment: any) => comment.id !== commentId),
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBio = async () => {
    if (!isOwnProfile) return;

    try {
      setIsUpdatingProfile(true);
      const response = await userService.updateProfile({
        bio: bioText
      });
      
      setProfile({
        ...profile,
        bio: response.data.bio
      });
      
      // If this is the current user's profile, update the auth context
      if (isOwnProfile && updateCurrentUser) {
        updateCurrentUser({
          ...currentUser,
          bio: response.data.bio
        });
      }
      
      setIsEditingBio(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) return;
    
    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', selectedAvatarFile);
      
      const response = await userService.uploadAvatar(formData);
      
      // Update profile state
      setProfile({
        ...profile,
        avatarUrl: response.data.avatarUrl
      });
      
      // If this is the current user's profile, update the auth context
      if (isOwnProfile && updateCurrentUser) {
        updateCurrentUser({
          ...currentUser,
          avatarUrl: response.data.avatarUrl
        });
      }
      
      // Reset the file input and preview
      setSelectedAvatarFile(null);
      setAvatarPreview(null);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
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
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-32 w-32 border-2 border-background">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                ) : (
                  <AvatarFallback className="text-3xl">
                    <UserIcon className="h-16 w-16 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              {isOwnProfile && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full bg-background shadow-md"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Avatar</DialogTitle>
                      <DialogDescription>
                        Upload a new profile picture.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      {avatarPreview && (
                        <div className="flex justify-center mb-4">
                          <Avatar className="h-40 w-40">
                            <AvatarImage src={avatarPreview} alt="Preview" />
                          </Avatar>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Select an image</Label>
                        <Input 
                          id="avatar" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        onClick={handleAvatarUpload}
                        disabled={!selectedAvatarFile || isUploadingAvatar}
                      >
                        {isUploadingAvatar && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  {isOwnProfile && (
                    <Badge className="ml-2 bg-den text-den-foreground">You</Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {isOwnProfile && !isEditingBio && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingBio(true)}
                    className="flex items-center gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Bio
                  </Button>
                )}
              </div>
              
              {isEditingBio ? (
                <div className="mt-4">
                  <Textarea 
                    value={bioText} 
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Write something about yourself..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioText(profile.bio || "");
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveBio}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm">
                    {profile.bio || (isOwnProfile ? "Add a bio to tell others about yourself..." : "This user hasn't added a bio yet.")}
                  </p>
                </div>
              )}
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
                    <div className="mb-2 text-xs flex justify-between items-center">
                      <div>
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
                        {comment.parentCommentId && (
                          <span className="text-muted-foreground ml-1">(reply)</span>
                        )}
                      </div>
                      
                      {isOwnProfile && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCommentDelete(comment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 px-2 text-muted-foreground hover:text-den"
                        onClick={async () => {
                          try {
                            const response = await commentService.voteComment(comment.id, true);
                            // Update comment vote count in userHistory
                            setUserHistory({
                              ...userHistory,
                              comments: userHistory.comments.map((c: any) => 
                                c.id === comment.id ? {...c, voteCount: response.data.voteCount} : c
                              )
                            });
                          } catch (error) {
                            console.error("Error voting on comment:", error);
                          }
                        }}
                      >
                        ▲ Upvote
                      </Button>
                      <span className="text-sm font-medium">{comment.voteCount}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 px-2 text-muted-foreground hover:text-den"
                        onClick={async () => {
                          try {
                            const response = await commentService.voteComment(comment.id, false);
                            // Update comment vote count in userHistory
                            setUserHistory({
                              ...userHistory,
                              comments: userHistory.comments.map((c: any) => 
                                c.id === comment.id ? {...c, voteCount: response.data.voteCount} : c
                              )
                            });
                          } catch (error) {
                            console.error("Error voting on comment:", error);
                          }
                        }}
                      >
                        ▼ Downvote
                      </Button>
                    </div>
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
