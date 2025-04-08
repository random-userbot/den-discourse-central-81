
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";

// Pages
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DenPage from "./pages/DenPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import CreateDen from "./pages/CreateDen";
import CreatePost from "./pages/CreatePost";
import NotFound from "./pages/NotFound";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="dissden-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/den/:denId" element={<DenPage />} />
                <Route path="/post/:postId" element={<PostPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                
                <Route path="/create-den" element={
                  <ProtectedRoute>
                    <CreateDen />
                  </ProtectedRoute>
                } />
                
                <Route path="/create-post/:denId" element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
