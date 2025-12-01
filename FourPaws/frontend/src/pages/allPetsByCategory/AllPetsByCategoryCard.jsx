/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { getDefaultPetImage } from "../../utils/petImageDefaults";



const AllPetsByCategoryCard = ({pet}) => {
   
    const {_id, name, category, age, image, images, location, addedDate, adoptionFee} = pet;
   
    //   const truncatedDescription = `${desp.split(' ').slice(0, 20).join(' ')}${desp.split(' ').length > 20 ? '...' : ''}`;
    return (
        <div>
      
        <div className="relative flex flex-col lg:flex-row w-full max-w-[48rem]  rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
<div className="relative lg:w-2/5 m-0 overflow-hidden text-gray-700 bg-white rounded-r-none shrink-0 rounded-xl bg-clip-border">
<img
src={images?.[0] || image || getDefaultPetImage(category)}
alt={name}
className="object-cover w-full h-full"
onError={(e) => {
  e.target.onerror = null;
  e.target.src = getDefaultPetImage(category);
}}
/>
</div>
<div></div>
<div className="p-6">
<h6 className="block mb-4 font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-pink-500 uppercase">
{name}
</h6>
<h4 className="block mb-2 font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
Category:{category}
</h4>
<p className="block mb-8 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
 {age}
</p>
<p className="block mb-8 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
 {location} 
</p>

{/* Adoption Fee Display */}
{adoptionFee && adoptionFee > 0 && (
  <p className="block mb-4 font-sans text-base antialiased font-semibold leading-relaxed text-green-600">
    Adoption Fee: ₹{parseFloat(adoptionFee).toFixed(2)}
  </p>
)}

<p className="block mb-8 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
 {addedDate}
</p>
<div className="inline-block">

<div className="flex lg:flex-none">
<Link to={`../adoptpet/${_id}`}><button className="btn mx-5 ">SEE DETAILS</button></Link> 

</div>
</div>
</div>
</div>
   </div>
    );
};

export default AllPetsByCategoryCard;