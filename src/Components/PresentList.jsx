import React, { useEffect, useState } from "react";
import axios from "axios";

const PresentList = () => {
  const [presentStudents, setPresentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial present list data
  const fetchPresentStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/present"); // Fetch present students from the backend
      setPresentStudents(response.data);
    } catch (error) {
      console.error("Error fetching present students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentStudents();

    // Auto-refresh attendance data every 60 seconds
    const interval = setInterval(fetchPresentStudents, 1000); // Update every 60 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Today's Present List</h1>

      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : presentStudents.length === 0 ? (
        <p className="text-lg text-gray-500">No students present yet.</p>
      ) : (
        <table className="w-full bg-white border border-gray-200 shadow-md rounded-xl">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Image</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Roll Number</th>
              <th className="py-3 px-6 text-left">Present</th>
              <th className="py-3 px-6 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {presentStudents.map((student) => (
              <tr key={student.roll} className="hover:bg-gray-100 border-b">
                <td className="py-3 px-6">
                  <img
                    src={student.profileImage} // Use profileImage field for image
                    alt={student.name}
                    className="w-12 h-12 rounded-full"
                  />
                </td>
                <td className="py-3 px-6 font-semibold">{student.name}</td>
                <td className="py-3 px-6">{student.roll}</td>
                <td className="py-3 px-6">
                  {student.status?.present ? (
                    <span className="text-green-500">✔</span> // Checkmark when present
                  ) : (
                    <span className="text-red-500">✘</span> // Cross when not present
                  )}
                </td>
                <td className="py-3 px-6">
                  {student.status?.present
                    ? new Date(student.dateTime).toLocaleTimeString() // Show timestamp if present
                    : "" // Empty string when not present
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PresentList;
