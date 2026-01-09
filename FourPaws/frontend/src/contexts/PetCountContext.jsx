import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchPetCategories } from '../utils/api';

const PetCountContext = createContext();

export const usePetCount = () => {
  const context = useContext(PetCountContext);
  if (!context) {
    throw new Error('usePetCount must be used within a PetCountProvider');
  }
  return context;
};

export const PetCountProvider = ({ children }) => {
  const [petCounts, setPetCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPetCounts = async () => {
    try {
      setLoading(true);
      const response = await fetchPetCategories();
      const categories = response.data || [];

      const counts = {};
      categories.forEach(category => {
        if (category && category.category) {
          counts[category.category.toLowerCase()] = category.petCount || 0;
        }
      });

      setPetCounts(counts);
    } catch (error) {
      console.error('Error fetching pet counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePetCount = (category, delta) => {
    // Update the local state immediately
    setPetCounts(prev => ({
      ...prev,
      [category.toLowerCase()]: Math.max(0, (prev[category.toLowerCase()] || 0) + delta)
    }));

    // Also fetch fresh counts from the server to ensure consistency
    fetchPetCounts();
  };

  useEffect(() => {
    fetchPetCounts();
  }, []);

  const value = {
    petCounts,
    loading,
    fetchPetCounts,
    updatePetCount
  };

  return (
    <PetCountContext.Provider value={value}>
      {children}
    </PetCountContext.Provider>
  );
};