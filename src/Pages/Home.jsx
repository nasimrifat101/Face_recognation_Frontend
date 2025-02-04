import React, { useState } from "react";
import FaceRecognize from "../components/FaceRecognize";
import PresentList from "../Components/PresentList";
import FaceRegister from "../Components/FaceRegister";



const Home = () => {
  const [activeTab, setActiveTab] = useState("register");

  return (
   <div className="flex">
     <div className="min-h-screen bg-gray-100 p-8 w-1/2">
      <h1 className="text-3xl font-bold text-center mb-8">
        Face Recognition Attendance System
      </h1>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "register"
              ? "bg-blue-500 text-white"
              : "bg-white border"
          }`}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "recognize"
              ? "bg-blue-500 text-white"
              : "bg-white border"
          }`}
          onClick={() => setActiveTab("recognize")}
        >
          Recognize
        </button>
      </div>
      <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
        {activeTab === "register" ? <FaceRegister /> : <FaceRecognize />}
      </div>
    </div>
    <div className="min-h-screen p-8 w-1/2">
      <PresentList />
    </div>
   </div>
  );
};

export default Home;