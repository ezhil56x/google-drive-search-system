import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { BACKEND_API_URL } from "../lib/consts";
import SearchComponent from "../components/SearchComponent";

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

  const ingestFile = async (fileId: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/ingest/${fileId}`,
        {},
        { withCredentials: true }
      );
      console.log("Ingested file", response.data);
    } catch (error) {
      console.error("Failed to ingest file", error);
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
    <div className="p-6 max-w-4xl mx-auto h-[80hv]">
      {user ? (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, {user.displayName}!
          </h1>

          <div className="mt-6">
            <SearchComponent />
          </div>

          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={fetchFiles}
          >
            Fetch Google Drive Files
          </button>

          <ul className="mt-6 space-y-4">
            {files.map((file) => (
              <li
                key={file.id}
                className="p-4 bg-gray-50 border rounded-lg flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="text-lg font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.owner} •{" "}
                    {new Date(file.modifiedTime).toLocaleString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    onClick={() => fetchFileContent(file.id)}
                  >
                    View Content
                  </button>
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                    onClick={() => ingestFile(file.id)}
                  >
                    Ingest
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {fileContent && (
            <div className="mt-6 p-4 border bg-gray-100 rounded-lg shadow">
              <h2 className="text-lg font-semibold">File Content:</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {fileContent}
              </pre>
            </div>
          )}

          <button
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-600">Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;
