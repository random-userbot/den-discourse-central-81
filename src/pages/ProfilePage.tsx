
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/api";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, User, Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import PostCard from "@/components/PostCard";
import CommentCard from "@/components/CommentCard";

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: userProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => userService.getUserProfile(Number(userId)),
  });
  
  const { data: userHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["userHistory", userId],
    queryFn: () => userService.getUserHistory(Number(userId)),
  });
  
  const isOwnProfile = currentUser && currentUser.id.toString() === userId;
  
  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.data.bio || "");
    }
  }, [userProfile]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };
  
  const handleSaveProfile = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Upload avatar if selected
      let avatarUrl = userProfile?.data.avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const response = await userService.uploadAvatar(formData);
        avatarUrl = response.data.avatarUrl;
      }
      
      // Update profile
      await userService.updateProfile({
        bio,
        avatarUrl
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setEditMode(false);
      refetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePost = async (postId: number) => {
    try {
      await refetchHistory();
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error("Error refreshing posts:", error);
    }
  };
  
  const handleDeleteComment = async () => {
    try {
      await refetchHistory();
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
  };
  
  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground mt-2">The user you are looking for does not exist.</p>
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
  
  const { username, avatarUrl, createdAt } = userProfile.data;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Avatar className="h-24 w-24">
                {editMode && avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt={username} />
                ) : (
                  <AvatarImage src={avatarUrl} alt={username} />
                )}
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <CardTitle className="text-2xl">{username}</CardTitle>
                <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground gap-1 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(createdAt), 'MMM yyyy')}</span>
                </div>
              </div>
            </div>
            
            {isOwnProfile && !editMode && (
              <Button onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
            
            {editMode && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="mt-1 flex items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative">
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow"
                        onClick={clearAvatarSelection}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Label 
                        htmlFor="avatar-upload" 
                        className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <Input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="sr-only" 
                          onChange={handleFileChange}
                        />
                      </Label>
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Click to upload a new profile picture
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 h-32"
                />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm leading-6">
                {userProfile.data.bio || "This user hasn't written a bio yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userHistory && userHistory.data.posts.length > 0 ? (
            userHistory.data.posts.map((post: any) => (
              <PostCard 
                key={post.id} 
                post={post}
                showDenInfo={true}
                onDelete={() => handleDeletePost(post.id)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="comments" className="space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userHistory && userHistory.data.comments.length > 0 ? (
            userHistory.data.comments.map((comment: any) => (
              <Card key={comment.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="text-sm text-muted-foreground">
                    Comment on post:{" "}
                    <span className="font-medium text-foreground">
                      <a href={`/post/${comment.postId}`} className="hover:underline">
                        {comment.postTitle || "Unknown Post"}
                      </a>
                    </span>
                    {" "}in den:{" "}
                    <span className="font-medium text-foreground">
                      <a href={`/den/${comment.denId}`} className="hover:underline">
                        {comment.denTitle || "Unknown Den"}
                      </a>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CommentCard 
                    comment={comment}
                    onDelete={handleDeleteComment}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No comments yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
