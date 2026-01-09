import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import PetListingCard from "./PetListingCard";
import InfiniteScroll from "react-infinite-scroll-component";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { toast } from "react-toastify";
import { debounce } from 'lodash';

const PetListing = () => {
  const [pets, setPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Initialize category from URL parameters immediately
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || '';
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPublic = useAxiosPublic();
  const location = useLocation();

  const fetchPets = useCallback(async (currentPage, category, query, signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosPublic.get('/pets', {
        params: {
          page: currentPage,
          limit: 12,
          category: category || undefined,
          location: query || undefined, // Using location for general search as per backend
        },
        signal,
      });

      if (response.data.success) {
        const { data, pagination } = response.data;
        // Ensure data is an array before setting it
        const petsData = Array.isArray(data) ? data : [];
        setPets(prevPets => (currentPage === 1 ? petsData : [...prevPets, ...petsData]));
        setTotalPages(pagination?.pages || 1);
        setHasMore(currentPage < (pagination?.pages || 1));
      } else {
        throw new Error(response.data.message || 'Failed to fetch pets');
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load pets.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [axiosPublic]);

  const debouncedFetch = useCallback(debounce(fetchPets, 500), [fetchPets]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category') || '';
    setSelectedCategory(categoryFromUrl);
  }, [location.search]);

  useEffect(() => {
    const controller = new AbortController();
    setPage(1);
    setPets([]);
    debouncedFetch(1, selectedCategory, searchQuery, controller.signal);
    return () => {
      controller.abort();
      debouncedFetch.cancel();
    };
  }, [searchQuery, selectedCategory, debouncedFetch]);

  const loadMorePets = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPets(nextPage, selectedCategory, searchQuery);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
  }, []);

  if (loading && (!pets || pets.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-gray-600">Loading pets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="alert alert-error max-w-md shadow-lg">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Error loading pets</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchPets()}
          className="btn btn-primary mt-6 gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  if (!loading && !error && (!pets || pets.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Pets Found</h2>
          <p className="text-gray-600 mb-6">There are currently no pets available for adoption. Please check back later.</p>
          <button
            onClick={() => fetchPets()}
            className="btn btn-primary gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Available Pets</h1>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center sticky top-0 bg-gray-50 z-10 py-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pets by name, breed, or description..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/3">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              <option value="dogs">Dogs</option>
              <option value="cats">Cats</option>
              <option value="birds">Birds</option>
              <option value="fish">Fish</option>
              <option value="rabbits">Rabbits</option>
              <option value="hamsters">Hamsters</option>
              <option value="other">Other</option>
            </select>
          </div>

          {(searchQuery || selectedCategory) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Pets Grid */}
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-xl text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchPets}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : pets.length > 0 ? (
            <InfiniteScroll
              dataLength={pets.length}
              next={loadMorePets}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center my-8">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              }
              endMessage={
                <p className="text-center py-8 text-gray-500">
                  You've seen all available pets!
                </p>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pets.map((pet) => (
                  <PetListingCard key={pet._id} pet={pet} />
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No pets found matching your search criteria.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetListing;