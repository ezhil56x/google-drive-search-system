import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { BACKEND_API_URL } from "../lib/consts";

const Dashboard = () => {
  interface User {
    id: string;
    displayName: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/auth/user`, {
          withCredentials: true,
        });
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

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/drive/files`, {
        withCredentials: true,
      });
      setFiles(response.data.files);
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
  };

  const fetchFileContent = async (fileId: string) => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/drive/file/${fileId}`,
        { withCredentials: true }
      );
      setFileContent(response.data.content);
    } catch (error) {
      console.error("Failed to fetch file content", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${BACKEND_API_URL}/auth/logout`, {
        withCredentials: true,
      });
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
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            onClick={fetchFiles}
          >
            Fetch Google Drive Files
          </button>

          <ul className="mt-4">
            {files.map((file) => (
              <li key={file.id} className="p-2 border-b">
                <strong>{file.name}</strong> - {file.owners[0].displayName} -{" "}
                {new Date(file.modifiedTime).toLocaleString()}
                <button
                  className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => fetchFileContent(file.id)}
                >
                  View Content
                </button>
              </li>
            ))}
          </ul>
          {fileContent && (
            <div className="mt-4 p-4 border">
              <h2 className="text-lg font-bold">File Content:</h2>
              <pre className="whitespace-pre-wrap">{fileContent}</pre>
            </div>
          )}
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleLogout}
          >
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
