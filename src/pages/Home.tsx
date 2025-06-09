import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { denService, postService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search, TrendingUp, Clock, Users } from "lucide-react";
import DenCard from "@/components/DenCard";
import PostCard from "@/components/PostCard";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">
              Discover DissDen
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore trending discussions and join vibrant communities
          </p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <form onSubmit={handleSearch} className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search posts, dens, and discussions..." 
                className="pl-12 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/50 dark:bg-gray-700/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <Button 
              onClick={() => navigate("/create-den")} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 h-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Den
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 lg:w-96 mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-1 shadow-lg border border-white/20">
            <TabsTrigger 
              value="posts" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent Posts {filteredPosts.length > 0 && searchTerm ? `(${filteredPosts.length})` : ''}
            </TabsTrigger>
            <TabsTrigger 
              value="dens" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              Communities {filteredDens.length > 0 && searchTerm ? `(${filteredDens.length})` : ''}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
              {isLoadingPosts ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading amazing posts...</p>
                  </div>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-6">
                  {filteredPosts.map((post: any) => (
                    <div key={post.id} className="transform hover:scale-[1.01] transition-transform duration-300">
                      <PostCard 
                        post={post} 
                        showDenInfo={true}
                        onDelete={() => handlePostDelete(post.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-blue-500" />
                  </div>
                  {searchTerm ? (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No posts found</h3>
                      <p className="text-gray-600 dark:text-gray-400">No posts match your search for "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No posts yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to start a conversation!</p>
                      <Button onClick={() => navigate("/create-den")} variant="outline" className="rounded-xl">
                        Create the first post
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="dens">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
              {isLoadingDens ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Finding great communities...</p>
                  </div>
                </div>
              ) : filteredDens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDens.map((den: any) => (
                    <div key={den.id} className="transform hover:scale-105 transition-transform duration-300">
                      <DenCard den={den} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-purple-500" />
                  </div>
                  {searchTerm ? (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No communities found</h3>
                      <p className="text-gray-600 dark:text-gray-400">No communities match your search for "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No communities yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Create the first community and start building connections!</p>
                      <Link to="/create-den">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl">
                          Create the first Den
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
