import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BACKEND_API_URL } from "../lib/consts";
import SignInGoogle from "../components/SignInGoogle";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios(`${BACKEND_API_URL}/auth/user`, {
          withCredentials: true,
        });
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
    <div className="flex flex-col h-screen justify-center items-center bg-gray-900 pb-48">
      <h1 className="text-white text-4xl font-bold mb-8">
        Google Drive Powered Search System
      </h1>
      <SignInGoogle />
    </div>
  );
};

export default Login;
