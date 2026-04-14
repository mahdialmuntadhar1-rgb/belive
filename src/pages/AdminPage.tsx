import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { 
  checkAdminAccess, 
  fetchBusinesses, 
  fetchAdminStats, 
  toggleBusinessVerification, 
  toggleBusinessFeatured, 
  deleteBusiness,
  fetchAppSettings,
  updateAppSettings,
  fetchPosts,
  createPost,
  togglePostFeatured,
  togglePostTrending,
  deletePost,
  uploadImage,
  AdminStats,
  Business,
  AppSettings,
  Post
} from '@/lib/adminApi';
import { supabase } from '@/lib/supabaseClient';

type TabType = 'overview' | 'content' | 'posts' | 'businesses' | 'settings';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats>({ total: 0, verified: 0, unverified: 0, featured: 0, posts: 0 });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Content editor state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [featuredLabel, setFeaturedLabel] = useState('');
  const [trendingLabel, setTrendingLabel] = useState('');

  // Post editor state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    setLoading(true);
    const result = await checkAdminAccess();
    
    if (result.error) {
      setError(result.error);
      setIsAdmin(false);
    } else {
      setIsAdmin(result.isAdmin);
      if (result.isAdmin) {
        await loadData();
      }
    }
    setLoading(false);
  };

  const loadData = async () => {
    const [statsResult, businessesResult, postsResult, settingsResult] = await Promise.all([
      fetchAdminStats(),
      fetchBusinesses(),
      fetchPosts(),
      fetchAppSettings()
    ]);

    if (statsResult.data) setStats(statsResult.data);
    if (businessesResult.data) setBusinesses(businessesResult.data);
    if (postsResult.data) setPosts(postsResult.data);
    if (settingsResult.data) {
      setAppSettings(settingsResult.data);
      setHeroTitle(settingsResult.data.hero_title_ar);
      setHeroSubtitle(settingsResult.data.hero_subtitle_ar);
      setFeaturedLabel(settingsResult.data.featured_label);
      setTrendingLabel(settingsResult.data.trending_label);
    }
  };

  const handleToggleVerified = async (id: string, currentValue: boolean) => {
    setActionLoading(id);
    const result = await toggleBusinessVerification(id, !currentValue);
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to update verification status');
    }
  };

  const handleToggleFeatured = async (id: string, currentValue: boolean) => {
    setActionLoading(id);
    const result = await toggleBusinessFeatured(id, !currentValue);
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to update featured status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(id);
    const result = await deleteBusiness(id);
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to delete business');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSaveContent = async () => {
    setActionLoading('content');
    const result = await updateAppSettings({
      hero_title_ar: heroTitle,
      hero_subtitle_ar: heroSubtitle,
      featured_label: featuredLabel,
      trending_label: trendingLabel
    });
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
      alert('Content updated successfully!');
    } else {
      alert(result.error || 'Failed to update content');
    }
  };

  const handleHeroImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadImage(file, 'hero-images');
    setUploading(false);

    if (result.success && result.url) {
      setActionLoading('hero-image');
      const updateResult = await updateAppSettings({ hero_image_url: result.url });
      setActionLoading(null);
      
      if (updateResult.success) {
        await loadData();
        alert('Hero image updated successfully!');
      } else {
        alert(updateResult.error || 'Failed to update hero image');
      }
    } else {
      alert(result.error || 'Failed to upload image');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert('Please enter post content');
      return;
    }

    setUploading(true);
    let imageUrl: string | undefined;

    if (newPostImage) {
      const uploadResult = await uploadImage(newPostImage, 'post-images');
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url;
      }
    }

    const result = await createPost({
      content: newPostContent,
      image_url: imageUrl,
      is_featured: false,
      is_trending: false
    });

    setUploading(false);
    setNewPostContent('');
    setNewPostImage(null);

    if (result.success) {
      await loadData();
      alert('Post created successfully!');
    } else {
      alert(result.error || 'Failed to create post');
    }
  };

  const handleTogglePostFeatured = async (id: string, currentValue: boolean) => {
    setActionLoading(id);
    const result = await togglePostFeatured(id, !currentValue);
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to update featured status');
    }
  };

  const handleTogglePostTrending = async (id: string, currentValue: boolean) => {
    setActionLoading(id);
    const result = await togglePostTrending(id, !currentValue);
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to update trending status');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setActionLoading(id);
    const result = await deletePost(id);
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to delete post');
    }
  };

  const handleToggleMaintenance = async () => {
    if (!appSettings) return;
    setActionLoading('maintenance');
    const result = await updateAppSettings({ maintenance_mode: !appSettings.maintenance_mode });
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to update maintenance mode');
    }
  };

  const handleToggleRegistration = async () => {
    if (!appSettings) return;
    setActionLoading('registration');
    const result = await updateAppSettings({ registration_enabled: !appSettings.registration_enabled });
    setActionLoading(null);
    
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Failed to update registration setting');
    }
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.location && b.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'verified' && b.is_verified) ||
      (filterStatus === 'unverified' && !b.is_verified);
    
    return matchesSearch && matchesFilter;
  });

  // Access denied state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error || 'You do not have permission to access this page.'}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg shadow-sm p-1 mb-6">
          {[
            { id: 'overview' as TabType, label: 'Overview' },
            { id: 'content' as TabType, label: 'Content Editor' },
            { id: 'posts' as TabType, label: 'Posts (Shaku Maku)' },
            { id: 'businesses' as TabType, label: 'Businesses' },
            { id: 'settings' as TabType, label: 'System Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.verified}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Unverified</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.unverified}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.featured}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600">Posts</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.posts}</p>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Maintenance Mode</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appSettings?.maintenance_mode ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {appSettings?.maintenance_mode ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">User Registration</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appSettings?.registration_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {appSettings?.registration_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Editor Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title (Arabic)</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle (Arabic)</label>
                  <textarea
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    disabled={uploading || actionLoading === 'hero-image'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {appSettings?.hero_image_url && (
                    <img src={appSettings.hero_image_url} alt="Hero" className="mt-2 h-32 rounded-md" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Labels</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Label</label>
                  <input
                    type="text"
                    value={featuredLabel}
                    onChange={(e) => setFeaturedLabel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trending Label</label>
                  <input
                    type="text"
                    value={trendingLabel}
                    onChange={(e) => setTrendingLabel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveContent}
              disabled={actionLoading === 'content'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === 'content' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    placeholder="Enter post content..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={uploading || !newPostContent.trim()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No posts yet
                        </td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{post.content}</td>
                          <td className="px-6 py-4">
                            {post.image_url && <img src={post.image_url} alt="Post" className="h-16 w-16 object-cover rounded" />}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleTogglePostFeatured(post.id, post.is_featured)}
                              disabled={actionLoading === post.id}
                              className={`px-2 py-1 text-xs rounded ${
                                post.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {post.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleTogglePostTrending(post.id, post.is_trending)}
                              disabled={actionLoading === post.id}
                              className={`px-2 py-1 text-xs rounded ${
                                post.is_trending ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {post.is_trending ? '🔥 Trending' : 'Not Trending'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={actionLoading === post.id}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'verified' | 'unverified')}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Businesses</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>
              </div>
            </div>

            {/* Businesses Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBusinesses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No businesses found
                        </td>
                      </tr>
                    ) : (
                      filteredBusinesses.map((business) => (
                        <tr key={business.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{business.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {business.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {business.location || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              business.is_verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {business.is_verified ? '✓ Verified' : '⏳ Unverified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              business.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {business.is_featured ? '⭐ Featured' : '☆ Not Featured'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(business.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleVerified(business.id, business.is_verified)}
                                disabled={actionLoading === business.id}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                title={business.is_verified ? 'Unverify' : 'Verify'}
                              >
                                {actionLoading === business.id ? '...' : business.is_verified ? '✓' : '✓'}
                              </button>
                              <button
                                onClick={() => handleToggleFeatured(business.id, business.is_featured)}
                                disabled={actionLoading === business.id}
                                className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                                title={business.is_featured ? 'Unfeature' : 'Feature'}
                              >
                                {actionLoading === business.id ? '...' : business.is_featured ? '⭐' : '⭐'}
                              </button>
                              <button
                                onClick={() => handleDeleteBusiness(business.id, business.name)}
                                disabled={actionLoading === business.id}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                title="Delete"
                              >
                                {actionLoading === business.id ? '...' : '🗑'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600">Disable public access to the application</p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    disabled={actionLoading === 'maintenance'}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      appSettings?.maintenance_mode
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:opacity-50`}
                  >
                    {actionLoading === 'maintenance' ? '...' : appSettings?.maintenance_mode ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">User Registration</h3>
                    <p className="text-sm text-gray-600">Allow new users to register</p>
                  </div>
                  <button
                    onClick={handleToggleRegistration}
                    disabled={actionLoading === 'registration'}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      appSettings?.registration_enabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {actionLoading === 'registration' ? '...' : appSettings?.registration_enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
