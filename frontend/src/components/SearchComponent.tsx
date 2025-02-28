import { useState } from "react";
import axios from "axios";
import { BACKEND_API_URL } from "../lib/consts";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<File[]>([]);

  interface File {
    title: string;
    modifiedTime: string;
    fileId: string;
  }

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const q = event.target.value;
    setQuery(q);

    if (q.length < 3) {
      setResults([]);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_API_URL}/search?q=${q}`, {
        withCredentials: true,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search your files..."
        className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {results.length > 0 && (
        <h2 className="text-xl mt-6 text-gray-200">Search results 👇🏻</h2>
      )}
      <ul className="mt-6 mb-6 space-y-4">
        {results.map((file) => (
          <li
            key={file.fileId}
            className="p-4 bg-gray-700 rounded-lg flex flex-row justify-between items-center"
          >
            <div className="flex flex-col">
              <p className="text-lg font-medium text-gray-200 mb-1">
                {file.title}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(file.modifiedTime).toLocaleString("en-GB")}
              </p>
            </div>
            <a
              href={`https://drive.google.com/file/d/${file.fileId}/view`}
              target="_blank"
            >
              <button className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                View in Drive
              </button>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchComponent;
