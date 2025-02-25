import React, { useEffect, useRef } from 'react';

function AutoVideoRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startRecording = async () => {
      try {
        // Request access to the user's camera and microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        // Create a new MediaRecorder instance
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        // Handle recording stop event
        mediaRecorder.onstop = () => {
          // Create a blob from the recorded chunks
          const blob = new Blob(chunksRef.current, {
            type: 'video/webm'
          });

          // Create a download link and trigger download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recording-${new Date().toISOString()}.webm`;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };

        // Start recording
        mediaRecorder.start();
        console.log('Recording started');

      } catch (error) {
        console.error('Error starting recording:', error);
      }
    };

    // Start recording when component mounts
    startRecording();

    // Cleanup function that runs when component unmounts
    return () => {
      mounted = false;
      
      // Stop recording if it's active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // Ensure we stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // This component doesn't need to render anything visible
  return null;
}

export default AutoVideoRecorder;