import { useEffect } from "react";
import { GrGithub } from "react-icons/gr";
import { useLocation, useNavigate } from "react-router-dom";


const NotFound = ({ message }: { message?: string }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="justify-center space-y-6">
        <GrGithub className="w-40 h-40 text-foreground" />
        <h1 className="text-5xl font-bold mb-2 text-foreground">User Not Found</h1>
        <p className="text-xl text-muted-foreground mb-2">
          {"The user you are looking for does not exist. Please try again with a different username."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary px-6 py-2 rounded font-semibold"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
