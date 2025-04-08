
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle>
          <Link to={`/den/${den.id}`} className="hover:text-den flex items-center">
            <span>{den.title}</span>
          </Link>
        </CardTitle>
        <div className="flex items-center text-muted-foreground text-xs">
          <span>Created by {den.creatorUsername}</span>
          <span className="mx-1">•</span>
          <span>{formatDistanceToNow(new Date(den.createdAt), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{den.description}</p>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full items-center">
          {den.postCount !== undefined && (
            <Badge variant="outline" className="text-xs">
              {den.postCount} {den.postCount === 1 ? "post" : "posts"}
            </Badge>
          )}
          <Link 
            to={`/den/${den.id}`} 
            className="text-xs text-den hover:underline"
          >
            View Den
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DenCard;
