
          // import Swiper core and required modules
          import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
          import { Link } from 'react-router-dom';
          import { Swiper, SwiperSlide } from 'swiper/react';
          import ban2 from '../../../../assets/banner1.jpg'
          import ban3 from '../../../../assets/banner2.jpg'
          import ban4 from '../../../../assets/banner-4.jpg'
        
          
          // Import Swiper styles
          import 'swiper/css';
          import 'swiper/css/navigation';
          import 'swiper/css/pagination';
          import 'swiper/css/scrollbar';
const Banner = () => {
    return (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-pink-200',
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-pink-500'
            }}
            navigation={true}
            loop={true}
            className="hero-swiper"
          >
            <SwiperSlide>
              <div className="hero min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-red-500/10"></div>
                <div className="hero-content flex-col lg:flex-row-reverse relative z-10">
                  <div className="lg:w-1/2">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                      <img src={ban2} className="relative w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl" />
                    </div>
                  </div>
                  <div className="lg:w-1/2 lg:pr-12">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                      <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                        Embrace Compassion:
                      </span>
                      <br />
                      <span className="text-gray-800">Rescue a Pet, Change a Life!</span>
                    </h1>
                    <p className="py-6 text-lg lg:text-xl text-gray-600 leading-relaxed">
                      Make a difference in the world by opening your heart and home to a shelter animal. 
                      Every adoption is a story of love, hope, and second chances.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/petlisting" className="btn bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-none px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Find Your Pet
                      </Link>
                      <Link to="/donationcampaign" className="btn btn-outline border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300">
                        Support Campaigns
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            
            <SwiperSlide>
              <div className="hero min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                <div className="hero-content flex-col lg:flex-row-reverse relative z-10">
                  <div className="lg:w-1/2">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                      <img src={ban3} className="relative w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl" />
                    </div>
                  </div>
                  <div className="lg:w-1/2 lg:pr-12">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Discover Unconditional Love:
                      </span>
                      <br />
                      <span className="text-gray-800">Adopt a Pet Today!</span>
                    </h1>
                    <p className="py-6 text-lg lg:text-xl text-gray-600 leading-relaxed">
                      Find your perfect companion and bring joy to your home by choosing adoption over buying. 
                      Experience the purest form of love and loyalty.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/petlisting" className="btn bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Browse Pets
                      </Link>
                      <Link to="/about" className="btn btn-outline border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300">
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            
            <SwiperSlide>
              <div className="hero min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10"></div>
                <div className="hero-content flex-col lg:flex-row-reverse relative z-10">
                  <div className="lg:w-1/2">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                      <img src={ban4} className="relative w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl" />
                    </div>
                  </div>
                  <div className="lg:w-1/2 lg:pr-12">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                      <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                        Transform Lives:
                      </span>
                      <br />
                      <span className="text-gray-800">Choose Adoption, Choose Love!</span>
                    </h1>
                    <p className="py-6 text-lg lg:text-xl text-gray-600 leading-relaxed">
                      Make a lasting impact by adopting a rescue pet and be a part of their incredible journey 
                      toward a brighter future filled with love and happiness.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/petlisting" className="btn bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-none px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Start Adoption
                      </Link>
                      <Link to="/contact" className="btn btn-outline border-green-500 text-green-600 hover:bg-green-500 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300">
                        Get Help
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
    );
};

export default Banner;
