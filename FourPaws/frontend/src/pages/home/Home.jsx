// Cache refresh: 2026-01-10T00:10:00Z
// Force Refresh: 2026-01-10T00:12:00
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPetCategories } from '../../utils/api';
import AboutUs from './homeComponents/aboutus/AboutUs';
import Action from './homeComponents/action/Action';
import Banner from './homeComponents/banner/Banner';
import Inspiration from './homeComponents/inspiration/Inspiration';
import PetCategory from './homeComponents/petCategory/PetCategory';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import { usePetCount } from '../../contexts/PetCountContext';

// Default pet categories in case API call fails
const defaultPetCategories = [
    {
        _id: "1",
        category: "Dogs",
        name: "Dogs",
        image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
        icon: "🐶",
        petCount: 0
    },
    {
        _id: "2",
        category: "Cats",
        name: "Cats",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1143&q=80",
        icon: "🐱",
        petCount: 0
    },
    {
        _id: "3",
        category: "Birds",
        name: "Birds",
        image: "https://images.unsplash.com/photo-1497206365907-f5e630693df0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        icon: "🐦",
        petCount: 0
    },
    {
        _id: "4",
        category: "Fish",
        name: "Fish",
        image: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80",
        icon: "🐠",
        petCount: 0
    }
];

const Home = () => {
    const { petCounts, loading: petCountLoading, fetchPetCounts } = usePetCount();

    const { data: petsCategory, isLoading, isError, refetch } = useQuery({
        queryKey: ['petCategories'],
        queryFn: fetchPetCategories,
        staleTime: 30 * 1000, // 30 seconds - shorter cache time
        retry: 2,
        refetchOnWindowFocus: true, // Refetch when window regains focus
        // Removed initialData to prevent caching old data
        select: (data) => {
            try {
                const categories = data.success ? (data.data || data) : data;
                if (Array.isArray(categories) && categories.length > 0) {
                    const processedCategories = categories.map(cat => ({
                        _id: cat._id || cat.id,
                        category: cat.category || cat.name || 'Unknown',
                        name: cat.name || cat.category || 'Unknown',
                        image: cat.image || `https://placehold.co/600x400?text=${encodeURIComponent(cat.category || cat.name || 'Pet')}`,
                        icon: cat.icon || '🐾',
                        petCount: (cat.category && petCounts[cat.category.toLowerCase()] !== undefined)
                            ? petCounts[cat.category.toLowerCase()]
                            : (cat.petCount || 0),
                        slug: cat.slug || (cat.category ? cat.category.toLowerCase() : ''),
                    }));

                    // Filter to show only 4 main categories: Dogs, Cats, Birds, Fish
                    const mainCategories = ['Dogs', 'Cats', 'Birds', 'Fish'];
                    const filteredCategories = processedCategories.filter(cat =>
                        mainCategories.includes(cat.category)
                    );

                    return filteredCategories;
                }
            } catch (error) {
                console.error('Error processing categories:', error);
            }
            return defaultPetCategories; // Return default on error or if no data
        },
    });

    // Refetch pet categories when pet counts change
    useEffect(() => {
        if (!petCountLoading) {
            refetch();
        }
    }, [petCounts, petCountLoading, refetch]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Error state is handled by falling back to initialData, but you can still show a toast or a subtle error message if needed.
    if (isError) {
        console.error("Failed to fetch pet categories. Falling back to default data.");
    }

    return (
        <>
            <Banner />

            <main className="flex-grow">
                {/* Pet Categories Section */}
                <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                                Find Your Perfect
                                <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent"> Companion</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Browse through our carefully curated pet categories and discover amazing animals
                                waiting for their forever homes
                            </p>
                        </div>

                        {petsCategory && petsCategory.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {petsCategory.map(category => (
                                    <PetCategory key={category._id} card={category} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
                                    <div className="text-6xl mb-4">🐾</div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Categories Available</h3>
                                    <p className="text-gray-600">We're working on adding more pet categories. Please check back soon!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <Action />
                <AboutUs />
                <Inspiration />
            </main>
        </>
    );
};

export default Home;