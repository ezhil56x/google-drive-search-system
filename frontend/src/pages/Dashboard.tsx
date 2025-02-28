import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { BACKEND_API_URL } from "../lib/consts";
import SearchComponent from "../components/SearchComponent";
import RenderContent from "../components/RenderContent";

const Dashboard = () => {
  interface User {
    id: string;
    displayName: string;
  }

  interface File {
    id: string;
    name: string;
    modifiedTime: string;
    owners: {
      displayName: string;
    }[];
  }

  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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

  const ingestAllFiles = async () => {
    for (const file of files) {
      await ingestFile(file.id);
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
    <div className="bg-gray-900 min-h-screen">
      <div className="p-6 max-w-4xl mx-auto min-h-[80vh]">
        {user ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-white">
                Welcome, {user.displayName}!
              </h1>

              <button
                className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:bg-red-600 disabled:opacity-50 disabled:pointer-events-none"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            <div className="flex justify-between items-center mb-6 mt-6">
              <button
                className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-teal-700 text-white hover:bg-teal-800 focus:outline-none focus:bg-teal-800 disabled:opacity-50 disabled:pointer-events-none"
                onClick={fetchFiles}
              >
                Fetch Google Drive Files
              </button>

              <button
                className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-teal-700 text-white hover:bg-teal-800 focus:outline-none focus:bg-teal-800 disabled:opacity-50 disabled:pointer-events-none"
                onClick={ingestAllFiles}
              >
                Ingest All Files
              </button>
            </div>

            <div className="mt-6">
              <SearchComponent />
            </div>

            {files.length > 0 && (
              <h2 className="text-xl mb-6 text-gray-200">
                Files in Google Drive
              </h2>
            )}

            <ul className="space-y-4">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="p-4 bg-gray-700 rounded-lg flex flex-col shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium text-gray-200 mb-1">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {file.owners[0].displayName}
                        {" - "}
                        {new Date(file.modifiedTime).toLocaleString("en-GB")}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none"
                        onClick={() => {
                          if (selectedFile === file.name) {
                            setSelectedFile(null);
                            setFileContent(null);
                          } else {
                            setFileContent(null);
                            fetchFileContent(file.id);
                            setSelectedFile(file.name);
                          }
                        }}
                      >
                        {selectedFile === file.name
                          ? "Hide Content"
                          : "View Content"}
                      </button>
                      <button
                        className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-teal-700 text-white hover:bg-teal-800 focus:outline-none focus:bg-teal-800 disabled:opacity-50 disabled:pointer-events-none"
                        onClick={() => ingestFile(file.id)}
                      >
                        Ingest
                      </button>
                    </div>
                  </div>

                  {selectedFile === file.name && fileContent && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <RenderContent
                        selectedFile={selectedFile!}
                        fileContent={fileContent}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
