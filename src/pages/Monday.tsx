import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MondaySidebar } from "@/components/monday/MondaySidebar";
import { MondayBoardView } from "@/components/monday/MondayBoardView";

const Monday = () => {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full">
      <MondaySidebar
        selectedBoardId={selectedBoardId}
        onSelectBoard={setSelectedBoardId}
      />
      <main className="flex-1 ml-60 bg-muted/30 min-h-screen">
        <MondayBoardView boardId={selectedBoardId} />
      </main>
    </div>
  );
};

export default Monday;
