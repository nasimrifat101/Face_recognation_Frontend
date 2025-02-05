import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

const FaceRecognize = ({ updatePresentList }) => {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState(null);

  // Load the face-api.js models
  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        console.log("Models loaded successfully.");
        setModel(faceapi.nets.ssdMobilenetv1); // Assign the loaded model
      } catch (error) {
        console.error("Error loading models:", error);
        setMessage("Error loading models. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  const recognizeFace = async () => {
    if (isLoading || !model) {
      console.log("Model is still loading...");
      setMessage("Loading model... Please wait.");
      return;
    }
  
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      setMessage("Unable to capture image. Please try again.");
      return;
    }
  
    try {
      const img = new Image();
      img.src = screenshot;
      await img.decode(); // Ensure the image is fully loaded
  
      // Detect faces
      const detections = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptors();
  
      if (detections.length === 0) {
        setMessage("No face detected.");
        return;
      }
  
      console.log(detections);
  
      // Convert the Float32Array to a regular array before sending it to the backend
      const faceEmbedding = Array.from(detections[0].descriptor);
  
      // Send face data to the backend for recognition
      const res = await axios.post("http://localhost:5000/api/recognize", {
        faceEmbedding: faceEmbedding, // Send faceEmbedding as an array
      });
  
      setMessage(res.data.message);
  
      if (res.data.isRecognized) {
        // If the face was recognized, update the present list
        updatePresentList(res.data.student);
      }
    } catch (error) {
      console.error("Error in face recognition:", error);
      setMessage("Error in face recognition.");
    }
  };
  

  // Automatically call recognizeFace every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      recognizeFace(); // Call recognition function every 2 seconds
    }, 2000); // Adjust the interval time if needed

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [isLoading]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Face Recognition</h2>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="mb-4 rounded shadow"
      />
      {isLoading && <p className="text-lg">Loading model...</p>}
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
};

export default FaceRecognize;
