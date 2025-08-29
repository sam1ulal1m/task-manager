import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Search, Eye, User, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const PublicBoards = () => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const fetchPublicBoards = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/boards/public?page=${page}&limit=12&search=${encodeURIComponent(search)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch public boards');
      }

      const data = await response.json();
      
      if (data.success) {
        setBoards(data.boards);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching public boards:', error);
      toast.error('Failed to load public boards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicBoards();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPublicBoards(1, searchQuery);
  };

  const handlePageChange = (page) => {
    fetchPublicBoards(page, searchQuery);
  };

  const getBackgroundStyle = (background) => {
    if (!background) return { backgroundColor: '#3b82f6' };
    
    if (background.startsWith('http')) {
      return {
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
    return { backgroundColor: background };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Public Boards
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore public boards shared by the community. Get inspired and discover new ideas.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search public boards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No public boards found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to share a public board!'}
            </p>
          </div>
        ) : (
          <>
            {/* Results info */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchQuery ? (
                  <>Showing {pagination.total} results for "{searchQuery}"</>
                ) : (
                  <>Showing {pagination.total} public boards</>
                )}
              </p>
            </div>

            {/* Boards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map((board) => (
                <Link
                  key={board._id}
                  to={`/board/${board._id}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Board Preview */}
                    <div 
                      className="h-32 flex items-center justify-center relative"
                      style={getBackgroundStyle(board.background)}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all" />
                      <h3 className="text-white font-semibold text-lg text-center px-4 relative z-10">
                        {board.title}
                      </h3>
                    </div>

                    {/* Board Info */}
                    <div className="p-4">
                      {board.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {board.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{board.owner.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {board.team && (
                        <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{board.team.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.current
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicBoards;
