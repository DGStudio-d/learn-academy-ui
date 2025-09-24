import React, { useState, useMemo } from 'react';
import { VirtualScrollList, VirtualGrid, InfiniteScroll } from './VirtualScrollList';
import { OptimizedImage } from './OptimizedImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Example data types
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  lastActive: string;
}

interface QuizResult {
  id: number;
  studentName: string;
  quizTitle: string;
  score: number;
  completedAt: string;
  duration: number;
}

// Generate mock data
const generateUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    role: ['student', 'teacher', 'admin'][i % 3],
    lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateQuizResults = (count: number): QuizResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    studentName: `Student ${i + 1}`,
    quizTitle: `Quiz ${Math.floor(i / 10) + 1}`,
    score: Math.floor(Math.random() * 100),
    completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: Math.floor(Math.random() * 3600) + 300, // 5 minutes to 1 hour
  }));
};

// Virtual List Example - User Management
export function VirtualUserList() {
  const [searchTerm, setSearchTerm] = useState('');
  const users = useMemo(() => generateUsers(10000), []);
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const renderUser = (user: User, index: number) => (
    <Card className="mx-2 mb-2">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <OptimizedImage
            src={user.avatar}
            alt={user.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium truncate">{user.name}</h3>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            <p className="text-xs text-gray-400">
              Last active: {new Date(user.lastActive).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Badge variant="outline">
          {filteredUsers.length.toLocaleString()} users
        </Badge>
      </div>
      
      <VirtualScrollList
        items={filteredUsers}
        itemHeight={100}
        containerHeight={600}
        renderItem={renderUser}
        getItemKey={(user) => user.id}
        className="border rounded-lg"
      />
    </div>
  );
}

// Virtual Grid Example - Image Gallery
export function VirtualImageGrid() {
  const images = useMemo(() => 
    Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      src: `https://picsum.photos/300/200?random=${i}`,
      alt: `Image ${i + 1}`,
      title: `Photo ${i + 1}`,
    })), []
  );

  const renderImage = (image: any, index: number) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <OptimizedImage
        src={image.src}
        alt={image.alt}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-3">
        <h3 className="text-sm font-medium">{image.title}</h3>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Image Gallery</h2>
        <Badge variant="outline">
          {images.length.toLocaleString()} images
        </Badge>
      </div>
      
      <VirtualGrid
        items={images}
        itemWidth={320}
        itemHeight={280}
        containerWidth={1200}
        containerHeight={600}
        gap={16}
        renderItem={renderImage}
        getItemKey={(image) => image.id}
      />
    </div>
  );
}

// Infinite Scroll Example - Quiz Results
export function InfiniteQuizResults() {
  const [allResults] = useState(() => generateQuizResults(50000));
  const [displayedResults, setDisplayedResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  
  const pageSize = 50;
  const hasNextPage = displayedResults.length < allResults.length;

  // Initial load
  React.useEffect(() => {
    setDisplayedResults(allResults.slice(0, pageSize));
    setPage(1);
  }, [allResults]);

  const loadMore = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const nextResults = allResults.slice(page * pageSize, (page + 1) * pageSize);
    setDisplayedResults(prev => [...prev, ...nextResults]);
    setPage(prev => prev + 1);
    setIsLoading(false);
  };

  const renderQuizResult = (result: QuizResult, index: number) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium">{result.studentName}</h3>
              <Badge variant={result.score >= 80 ? 'default' : result.score >= 60 ? 'secondary' : 'destructive'}>
                {result.score}%
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{result.quizTitle}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span>Completed: {new Date(result.completedAt).toLocaleDateString()}</span>
              <span>Duration: {Math.floor(result.duration / 60)}m {result.duration % 60}s</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quiz Results</h2>
        <Badge variant="outline">
          {displayedResults.length.toLocaleString()} of {allResults.length.toLocaleString()} results
        </Badge>
      </div>
      
      <div className="border rounded-lg p-4" style={{ height: '600px', overflow: 'auto' }}>
        <InfiniteScroll
          items={displayedResults}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          loadMore={loadMore}
          renderItem={renderQuizResult}
          loadingComponent={
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading more results...</span>
            </div>
          }
          threshold={100}
        />
      </div>
    </div>
  );
}

// Combined Performance Demo
export function PerformanceDemo() {
  const [activeTab, setActiveTab] = useState<'list' | 'grid' | 'infinite'>('list');

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Performance Optimization Demo</h1>
        <p className="text-gray-600">
          Demonstrating virtual scrolling, lazy loading, and infinite scroll with large datasets
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        <Button
          variant={activeTab === 'list' ? 'default' : 'outline'}
          onClick={() => setActiveTab('list')}
        >
          Virtual List (10K Users)
        </Button>
        <Button
          variant={activeTab === 'grid' ? 'default' : 'outline'}
          onClick={() => setActiveTab('grid')}
        >
          Virtual Grid (1K Images)
        </Button>
        <Button
          variant={activeTab === 'infinite' ? 'default' : 'outline'}
          onClick={() => setActiveTab('infinite')}
        >
          Infinite Scroll (50K Results)
        </Button>
      </div>

      <div className="mt-6">
        {activeTab === 'list' && <VirtualUserList />}
        {activeTab === 'grid' && <VirtualImageGrid />}
        {activeTab === 'infinite' && <InfiniteQuizResults />}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Performance Notes:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Virtual scrolling renders only visible items, maintaining 60fps with large datasets</li>
          <li>• Images are lazy-loaded and optimized with responsive sizing</li>
          <li>• Infinite scroll loads data progressively to reduce initial load time</li>
          <li>• All components use React.memo and useMemo for optimal re-rendering</li>
        </ul>
      </div>
    </div>
  );
}