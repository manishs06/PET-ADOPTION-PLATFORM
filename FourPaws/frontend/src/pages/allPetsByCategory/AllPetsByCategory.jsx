



import AllPetsByCategoryCard from './AllPetsByCategoryCard';
import { useLoaderData } from 'react-router-dom';

const AllPetsByCategory = () => {
  const pets = useLoaderData()
  const petsByCategory = Array.isArray(pets?.data) ? pets.data : [];

  if (!petsByCategory || petsByCategory.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h2 className='text-center text-3xl font-bold'>No available products</h2>
      </div>
    );
  }
  return (
    <div>
      <div>
        <h2 className='text-center text-3xl lg:m-10 font-bold'>Available Pets: {petsByCategory.length}</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:gap-10 lg:mx-20 my-16'>
          {petsByCategory.map((pet) => (
            <AllPetsByCategoryCard key={pet._id} pet={pet} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllPetsByCategory;
