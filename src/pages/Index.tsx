
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, MessageCircle, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-pink-400 to-blue-500 rounded-full opacity-20 animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Logo/Brand */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center space-x-3 mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-glow">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-6xl font-extrabold text-gradient">
                Diss<span className="text-blue-600">Den</span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white leading-tight">
                Where <span className="text-gradient">Ideas</span> Meet <span className="text-gradient">Community</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join vibrant discussions, share your thoughts, and connect with like-minded individuals in topic-specific communities.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mt-12 mb-12"
            >
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Communities</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Create and join topic-specific dens</p>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <MessageCircle className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Discussions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Engage in meaningful conversations</p>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Discovery</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Find new ideas and perspectives</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <button
                onClick={handleExplore}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-glow"
              >
                <span className="flex items-center space-x-2">
                  <span>Start Exploring</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
