import { GitHubPortfolio } from "@/components/GitHubPortfolio";
import { useParams } from "react-router-dom";

const Index = () => {
  const { username } = useParams<{ username?: string }>();
  
  return <GitHubPortfolio initialUsername={username} />;
};

export default Index;
