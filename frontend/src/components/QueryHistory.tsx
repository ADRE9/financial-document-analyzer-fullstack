import { useState, useEffect, useCallback } from "react";
import { Clock, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  usageCount: number;
}

interface QueryHistoryProps {
  onQuerySelect?: (query: string) => void;
  className?: string;
}

const STORAGE_KEY = "financial-analyzer-query-history";
const MAX_HISTORY_ITEMS = 10;

export const QueryHistory = ({
  onQuerySelect,
  className = "",
}: QueryHistoryProps) => {
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load query history from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setQueryHistory(parsed);
      }
    } catch (error) {
      console.error("Error loading query history:", error);
    }
  }, []);

  // Save query history to localStorage whenever it changes
  const saveQueryHistory = useCallback((history: QueryHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving query history:", error);
    }
  }, []);

  // Add a new query to history
  const addToHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      setQueryHistory((prevHistory) => {
        // Check if query already exists
        const existingIndex = prevHistory.findIndex(
          (item) => item.query === query
        );

        let newHistory: QueryHistoryItem[];

        if (existingIndex >= 0) {
          // Query exists, update usage count and move to top
          const existingItem = {
            ...prevHistory[existingIndex],
            usageCount: prevHistory[existingIndex].usageCount + 1,
            timestamp: new Date().toISOString(),
          };
          newHistory = [
            existingItem,
            ...prevHistory.filter((_, index) => index !== existingIndex),
          ];
        } else {
          // New query, add to top
          const newItem: QueryHistoryItem = {
            id: Date.now().toString(),
            query,
            timestamp: new Date().toISOString(),
            usageCount: 1,
          };
          newHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        }

        saveQueryHistory(newHistory);
        return newHistory;
      });
    },
    [saveQueryHistory]
  );

  // Remove a query from history
  const removeFromHistory = useCallback(
    (queryId: string) => {
      setQueryHistory((prevHistory) => {
        const newHistory = prevHistory.filter((item) => item.id !== queryId);
        saveQueryHistory(newHistory);
        return newHistory;
      });
      toast.success("Query removed from history");
    },
    [saveQueryHistory]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setQueryHistory([]);
    saveQueryHistory([]);
    toast.success("Query history cleared");
  }, [saveQueryHistory]);

  // Handle query selection
  const handleQuerySelect = useCallback(
    (query: string) => {
      addToHistory(query);
      onQuerySelect?.(query);
      toast.success("Query selected");
    },
    [addToHistory, onQuerySelect]
  );

  // Copy query to clipboard
  const copyToClipboard = useCallback(async (query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      toast.success("Query copied to clipboard");
    } catch {
      toast.error("Failed to copy query");
    }
  }, []);

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  // No global window reference needed - use proper React patterns instead

  if (queryHistory.length === 0) {
    return null; // Don't render if no history
  }

  const displayedHistory = isExpanded ? queryHistory : queryHistory.slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recent Queries</span>
            <Badge variant="secondary" className="text-xs">
              {queryHistory.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {queryHistory.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? "Show Less" : "Show All"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayedHistory.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-3">
                  <p
                    className="text-sm text-gray-800 line-clamp-2 cursor-pointer"
                    onClick={() => handleQuerySelect(item.query)}
                  >
                    "{item.query}"
                  </p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Used {item.usageCount}x
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(item.query)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromHistory(item.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {queryHistory.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              Click any query to reuse it
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export a hook for using query history functionality
// eslint-disable-next-line react-refresh/only-export-components
export const useQueryHistory = () => {
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const history: QueryHistoryItem[] = stored ? JSON.parse(stored) : [];

      // Check if query already exists
      const existingIndex = history.findIndex((item) => item.query === query);

      let newHistory: QueryHistoryItem[];

      if (existingIndex >= 0) {
        // Query exists, update usage count and move to top
        const existingItem = {
          ...history[existingIndex],
          usageCount: history[existingIndex].usageCount + 1,
          timestamp: new Date().toISOString(),
        };
        newHistory = [
          existingItem,
          ...history.filter((_, index) => index !== existingIndex),
        ];
      } else {
        // New query, add to top
        const newItem: QueryHistoryItem = {
          id: Date.now().toString(),
          query,
          timestamp: new Date().toISOString(),
          usageCount: 1,
        };
        newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error saving query history:", error);
    }
  }, []);

  return { addToHistory };
};

export default QueryHistory;
