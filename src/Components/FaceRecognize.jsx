import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

const FaceRecognize = ({ updatePresentList }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        console.log("Models loaded successfully.");
        setModelLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  const recognizeFace = async () => {
    if (!modelLoaded || !webcamRef.current || !webcamRef.current.video) {
      return;
    }
    
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    
    // Detect all faces with landmarks and descriptors
    const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detections.length > 0) {
      // Map each detected face to its embedding
      const faceEmbeddings = detections.map(detection => Array.from(detection.descriptor));
      
      try {
        // Send all embeddings to the backend
        const res = await axios.post("http://localhost:5000/api/recognize", { faceEmbeddings });
        console.log("Response from backend:", res.data);
        const { recognizedFaces } = res.data;
      
        // Draw each detected face and its recognized name
        detections.forEach((detection, index) => {
          const box = detection.detection.box;
          context.strokeStyle = "#00FF00";
          context.lineWidth = 2;
          // Adjust these offsets as needed for proper alignment
          context.strokeRect(box.x - 65, box.y -55, box.width, box.height);
          
          context.fillStyle = "#00FF00";
          context.font = "16px Arial";
          const name = recognizedFaces[index]?.name || "Unknown";
          context.fillText(name, box.x - 10, box.y - 5);
          
          // If the face is recognized, update the present list
          if (name !== "Unknown" && typeof updatePresentList === "function") {
            updatePresentList(name);
          }
        });
      } catch (error) {
        console.error("Error in face recognition:", error);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      recognizeFace();
    }, 2000);
    return () => clearInterval(interval);
  }, [modelLoaded]);

  return (
    <div className="relative flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Face Recognition</h2>
      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="mb-4 rounded shadow"
        />
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
      </div>
      {isLoading && <p className="text-lg">Loading model...</p>}
    </div>
  );
};

export default FaceRecognize;
