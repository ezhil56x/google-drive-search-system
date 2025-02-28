import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BACKEND_API_URL } from '../lib/consts';

const Login = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    window.location.href = `${BACKEND_API_URL}/auth/google`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios(`${BACKEND_API_URL}/auth/user`, { withCredentials: true });
        if (response.data.user) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex h-screen justify-center items-center">
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleLogin}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
