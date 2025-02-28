import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { BACKEND_API_URL } from '../lib/consts';

const Dashboard = () => {
  
  interface User {
    id: string;
    displayName: string;
  }
  
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/auth/user`, { withCredentials: true });
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        navigate("/");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${BACKEND_API_URL}/auth/logout`, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="p-4">
      {user ? (
        <div>
          <h1>Welcome, {user.displayName}!</h1>
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;
