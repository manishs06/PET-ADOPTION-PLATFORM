import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import logincat from '../../assets/logincat.jpg';
import { AuthContext } from '../../components/providers/AuthWrapper';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  useEffect(() => {
    AOS.init({ duration: '1000' })
  }, [])

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful!');
        // Persist remember-me preference
        localStorage.setItem('remember-me', rememberMe ? 'true' : 'false');
        
        // Get user data from AuthContext after successful login
        const token = localStorage.getItem('access-token');
        if (token) {
          // Decode token to get user role or fetch user data
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            const userRole = userData.user?.role || 'user';
            
            // Navigate based on user role
            if (userRole === 'admin') {
              navigate('/admin-dashboard', { replace: true });
            } else {
              navigate(from, { replace: true });
            }
          } else {
            // Fallback navigation if user data fetch fails
            navigate(from, { replace: true });
          }
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
   
    return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Image and Welcome Text */}
          <div className="hidden lg:block">
            <div className="relative">
              <img src={logincat} alt="Pet Login" className="w-full h-[600px] object-cover rounded-2xl shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <h2 className="text-4xl font-bold mb-4">
                    Welcome to <span className="text-yellow-300">FourPaws</span>
                  </h2>
                  <p className="text-xl mb-6">Your trusted pet adoption platform</p>
                  <div className="flex items-center justify-center space-x-4 text-lg">
                    <span className="flex items-center">
                      <span className="text-yellow-300 mr-2">🐾</span>
                      Pet Adoption
                    </span>
                    <span className="flex items-center">
                      <span className="text-yellow-300 mr-2">❤️</span>
                      Donation Campaigns
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600">
                  Sign in to your account to continue
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
        <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 pl-12"
                      placeholder="Enter your email"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
      </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 pl-12"
                      placeholder="Enter your password"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
      </div>
    </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
        <input
                      id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
        />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
        Remember me
      </label>
                  </div>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500 transition-colors duration-300">
                      Forgot your password?
                    </Link>
                  </div>
    </div>

    <button
      type="submit" 
      disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
    </button>
   
                {/* Removed Google and Facebook login options */}
                {/* You can add other login options here if needed */}

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-pink-600 hover:text-pink-500 transition-colors duration-300">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
  </div>
  </div>
             </div>
  </div>
  <ToastContainer />
</div>
    );
};

export default Login;