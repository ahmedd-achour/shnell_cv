import { Component, OnInit, AfterViewInit } from '@angular/core';

// Declare tmImage globally as it's provided by the Teachable Machine library
declare var tmImage: any;

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css']
})
export class WebcamComponent implements OnInit, AfterViewInit {

  private model: any;
  private webcam: any;
  private labelContainer: HTMLElement;
  private maxPredictions: number;
  private readonly URL: string = "https://teachablemachine.withgoogle.com/models/RhTbwo-BY/";

  // Video recording setup
  private mediaRecorder: any;
  private recordedChunks: any[] = [];
  private isRecording: boolean = false;
  private videoUrl: string = '';

  constructor() { }

  ngOnInit(): void {
    // Initialize when the component is loaded
  }

  ngAfterViewInit(): void {
    this.init();
  }

  // Load the image model and setup the webcam
  async init() {
    const modelURL = this.URL + "model.json";
    const metadataURL = this.URL + "metadata.json";

    try {
      alert("Loading model and metadata...");
      this.model = await tmImage.load(modelURL, metadataURL);
      this.maxPredictions = this.model.getTotalClasses();

      // Set up the webcam
      const flip = true; // Whether to flip the webcam
      this.webcam = new tmImage.Webcam(200, 200, flip); // Width, height, flip

      await this.webcam.setup();  // Request access to the webcam
      alert("Webcam setup completed.");

      await this.webcam.play();  // Start webcam playback

      // Append webcam canvas to DOM
      const webcamContainer = document.getElementById("webcam-container");
      if (webcamContainer) {
        webcamContainer.appendChild(this.webcam.canvas);
      }

      this.labelContainer = document.getElementById("label-container") as HTMLElement;

      // Create div elements for each class label
      for (let i = 0; i < this.maxPredictions; i++) {
        this.labelContainer.appendChild(document.createElement("div"));
      }

      window.requestAnimationFrame(this.loop.bind(this));  // Start the loop for predictions
    } catch (e) {
      alert("Error initializing model: " + e);
      console.error("Error initializing model:", e);
    }
  }

  // Continuously update webcam and run predictions
  async loop() {
    this.webcam.update();  // Update the webcam frame
    await this.predict();  // Run predictions on the current frame
    window.requestAnimationFrame(this.loop.bind(this));  // Continue the loop
  }

  // Run the webcam image through the model and check for class detections
  async predict() {
    const prediction = await this.model.predict(this.webcam.canvas);

    if (prediction[0].probability.toFixed(2) > 0.9) {
      // If Sachet detected, start recording
      this.labelContainer.childNodes[0].textContent = "Sachet detected";
      this.startRecording();
    }
    else if (prediction[1].probability.toFixed(2) > 0.97) {
      // If Bottle detected, start recording
      this.labelContainer.childNodes[0].textContent = "Bottle detected";
      this.startRecording();
    }
    else {
      // If no object detected, stop recording
      this.labelContainer.childNodes[0].textContent = "No Trash detected";
      this.stopRecording();
    }
  }

  // Start recording the webcam
  startRecording() {
    if (this.isRecording) return;  // Do nothing if already recording
    this.isRecording = true;

    const stream = this.webcam.canvas.captureStream(30);  // Capture the webcam stream at 30fps
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    this.mediaRecorder.ondataavailable = (event: any) => {
      this.recordedChunks.push(event.data);  // Store the recorded data
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: "video/webm" });
      this.recordedChunks = [];
      this.videoUrl = URL.createObjectURL(blob);  // Create a URL for the video blob
      this.downloadVideo();  // Trigger the download
    };

    this.mediaRecorder.start();
  }

  // Stop the recording
  stopRecording() {
    if (this.isRecording) {
      this.labelContainer.childNodes[0].textContent = "Trash is being rejected....";

      setTimeout(() => {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }, 4000);
    }
  }

  // Download the video as a .webm file
  downloadVideo() {
    const link = document.createElement('a');
    link.href = this.videoUrl;
    link.download = 'recorded-video.webm';  // The filename for the video
    link.click();  // Programmatically click the link to download the video
  }

}
