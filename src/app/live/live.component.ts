import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.css']
})
export class LiveComponent implements OnInit, OnDestroy {
  frameUrl: string = '';
  socket: WebSocket;
  subscription: Subscription;

  constructor() {}

  ngOnInit(): void {
    // Create WebSocket connection
    this.socket = new WebSocket('ws://localhost:8765');

    // Handle incoming messages (frames) from the server
    this.socket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const base64Frame = message.frame;

      // Convert base64 back to Blob and create an object URL for image
      const byteCharacters = atob(base64Frame);
      const byteArray = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      this.frameUrl = URL.createObjectURL(blob);
    };
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
