
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Diss<span className="text-gray-600">Den</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-4 font-light">
            A place for thoughtful discussions
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Join communities, share ideas, and engage in meaningful conversations 
            with people who share your interests.
          </p>
          <Button 
            onClick={handleExplore}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg"
          >
            Start Exploring
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 border border-gray-200 rounded">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Communities</h3>
            <p className="text-gray-600">
              Create and join topic-specific dens where like-minded people gather
            </p>
          </div>
          <div className="text-center p-8 border border-gray-200 rounded">
            <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Discussions</h3>
            <p className="text-gray-600">
              Share your thoughts and engage in meaningful conversations
            </p>
          </div>
          <div className="text-center p-8 border border-gray-200 rounded">
            <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Discovery</h3>
            <p className="text-gray-600">
              Find new ideas, perspectives, and interesting content
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 border border-gray-200 rounded p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to join the conversation?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Create an account and start participating in discussions today.
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => navigate("/register")}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2"
            >
              Sign Up
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
