
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { denService, postService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search } from "lucide-react";
import DenCard from "@/components/DenCard";
import PostCard from "@/components/PostCard";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("q") || "";
  
  const [dens, setDens] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoadingDens, setIsLoadingDens] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [activeTab, setActiveTab] = useState("posts");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDens = async () => {
      try {
        setIsLoadingDens(true);
        const response = await denService.getAllDens();
        setDens(response.data);
      } catch (error) {
        console.error("Error fetching dens:", error);
        toast({
          title: "Error",
          description: "Failed to load dens. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDens(false);
      }
    };

    const fetchAllPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const response = await postService.getAllPosts();
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchDens();
    fetchAllPosts();
  }, [toast]);

  useEffect(() => {
    // Update search params when search term changes
    if (searchTerm) {
      setSearchParams({ q: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  const handlePostDelete = (postId: number) => {
    setPosts(posts.filter((post: any) => post.id !== postId));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // No need to do anything else since we're already updating searchParams with useEffect
  };

  const filteredPosts = posts.filter((post: any) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.denTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDens = dens.filter((den: any) =>
    den.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (den.description && den.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (den.creatorName && den.creatorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Welcome to DissDen</h1>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-grow md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search posts and dens..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <Button onClick={() => navigate("/create-den")} className="bg-den hover:bg-den-accent whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Create Den
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="posts">
            Recent Posts {filteredPosts.length > 0 && searchTerm ? `(${filteredPosts.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="dens">
            Popular Dens {filteredDens.length > 0 && searchTerm ? `(${filteredDens.length})` : ''}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="bg-card shadow-sm rounded-lg p-6">
          {isLoadingPosts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post: any) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  showDenInfo={true}
                  onDelete={() => handlePostDelete(post.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {searchTerm ? (
                <p className="text-muted-foreground mb-4">No posts found matching "{searchTerm}"</p>
              ) : (
                <p className="text-muted-foreground mb-4">No posts available yet.</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="dens" className="bg-card shadow-sm rounded-lg p-6">
          {isLoadingDens ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDens.map((den: any) => (
                <DenCard key={den.id} den={den} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {searchTerm ? (
                <p className="text-muted-foreground mb-4">No dens found matching "{searchTerm}"</p>
              ) : (
                <p className="text-muted-foreground mb-4">No dens available yet.</p>
              )}
              <Link to="/create-den">
                <Button variant="outline">Create the first Den</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
