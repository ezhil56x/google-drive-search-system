import { useState } from "react";
import axios from "axios";
import { BACKEND_API_URL } from "../lib/consts";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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
        className="w-full p-2 border rounded"
      />
      <ul className="mt-4">
        {results.map((file) => (
          <li key={file.fileId} className="p-2 border-b">
            <strong>{file.title}</strong> - {file.owner}
            <br />
            <span className="text-gray-600">
              Last modified: {new Date(file.modifiedTime).toLocaleString()}
            </span>
            <br />
            <a
              href={`https://drive.google.com/file/d/${file.fileId}/view`}
              target="_blank"
              className="text-blue-500"
            >
              View in Drive
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchComponent;
