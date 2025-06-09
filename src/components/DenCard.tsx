import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Users, MessageSquare, Calendar } from "lucide-react";

interface DenCardProps {
  den: {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    creatorUsername: string;
    createdAt: string;
    postCount?: number;
  };
}

const DenCard = ({ den }: DenCardProps) => {
  return (
    <Card className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
      {den.imageUrl && (
        <div className="relative h-32 overflow-hidden">
          <img 
            src={den.imageUrl}
            alt={den.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <Link to={`/den/${den.id}`} className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group-hover:text-blue-600 flex items-center">
            <span className="truncate">d/{den.title}</span>
          </Link>
          {den.postCount !== undefined && (
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
              <MessageSquare className="w-3 h-3 mr-1" />
              {den.postCount}
            </Badge>
          )}
        </CardTitle>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
          <Users className="w-4 h-4" />
          <span className="truncate">by {den.creatorUsername}</span>
        </div>
      </CardHeader>
      
      <CardContent className="py-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {den.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{formatDistanceToNow(new Date(den.createdAt), { addSuffix: true })}</span>
        </div>
        
        <Link 
          to={`/den/${den.id}`} 
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
        >
          Explore →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DenCard;
