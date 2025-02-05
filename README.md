# Face Recognition Attendance Frontend

This project is the frontend part of a face recognition-based attendance system. It uses **React**, **face-api.js**, and **Axios** to capture student attendance automatically based on face recognition.

## Table of Contents
- [Project Features](#project-features)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Available Components](#available-components)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Project Features
- **Automatic Face Recognition:** Captures face images and recognizes registered students without user interaction.
- **Daily Attendance Tracking:** Displays a list of all students, marking the present ones with timestamps.
- **Real-Time Updates:** Auto-refreshes attendance data to keep the list up to date.
- **Model Loading:** Integrates face-api.js for face detection and landmark recognition.
- **Clean UI:** Built with modern UI components for ease of use.

## Folder Structure
```
root
├── src
│   ├── components
│   │   ├── FaceRegister.jsx  // Face recognition component
│   │   ├── FaceRecognize.jsx  // Face recognition component
│   │   └── PresentList.jsx    // Attendance display component
│   ├── App.js                 // Main app component
│   └── index.js               // Entry point for React
├── public
│   └── models                 // Face-api.js models
└── package.json
```

## Prerequisites
Ensure you have the following installed:
- **Node.js (v14 or higher)**
- **npm (Node Package Manager)**

## Installation
1. Clone the repository:
    ```bash
    git clone <your-repo-url>
    ```

2. Navigate to the project directory:
    ```bash
    cd face-recognition-frontend
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Download the face-api.js models and place them inside the `public/models` directory.
    You can get the models from [face-api.js GitHub](https://github.com/justadudewhohacks/face-api.js).

## Running the Application
Start the development server:
```bash
npm start
```
The application will run at [http://localhost:3000](http://localhost:3000).

## Usage
### Face Recognition
1. Navigate to the "Face Recognition" section.
2. Ensure the camera is enabled.
3. Stand in front of the camera.
4. If recognized, your attendance will be recorded.

### Viewing Attendance
1. Navigate to the "Present List" section.
2. View all students along with their attendance status for the current day.

## Available Components
### FaceRecognize.jsx
Handles face detection and recognition using face-api.js. Captures screenshots from the webcam and sends face embeddings to the backend.

### PresentList.jsx
Displays all students, marking those present for the current day with timestamps.

## API Endpoints
Ensure the backend server is running at `http://localhost:5000`. Below are the main API endpoints used:

- **POST /api/register:** Register a new student with face embeddings.
- **POST /api/recognize:** Recognize a student based on face embeddings.
- **GET /api/present:** Fetch the attendance list for the current day.

## Troubleshooting
### Face-api.js Models Not Loading
Ensure that the models are located in `public/models` and correctly referenced in the `FaceRecognize.jsx` component:
```javascript
await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
```

### CORS Issues
If the backend API rejects requests, enable CORS in the backend using the `cors` package:
```bash
npm install cors
```
In your backend `server.js` file:
```javascript
const cors = require('cors');
app.use(cors());
```

### Camera Not Detecting Face
- Ensure camera permissions are granted.
- Check for proper lighting.
- Ensure that the models are fully loaded.

### Attendance Not Updating
- Verify the backend is running and reachable at `http://localhost:5000`.
- Check console logs for API request errors.

## Future Improvements
- **Enhanced Security:** Add user authentication.
- **Mobile Support:** Optimize for mobile browsers.
- **Advanced Face Recognition:** Improve model accuracy with better embeddings.
- **Historical Attendance Records:** Show previous attendance records.

---
For any issues or feature requests, feel free to contribute or raise an issue in the repository.

