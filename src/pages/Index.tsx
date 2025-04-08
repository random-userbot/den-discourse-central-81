
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { denService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import DenCard from "@/components/DenCard";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [dens, setDens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDens = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchDens();
  }, [toast]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome to DissDen</h1>
        <Button onClick={() => navigate("/create-den")} className="bg-den hover:bg-den-accent">
          <Plus className="h-4 w-4 mr-2" />
          Create Den
        </Button>
      </div>

      <div className="bg-card shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Popular Dens</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : dens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dens.map((den) => (
              <DenCard key={den.id} den={den} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No dens available yet.</p>
            <Link to="/create-den">
              <Button variant="outline">Create the first Den</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
