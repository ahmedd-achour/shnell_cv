import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/chatbot/environment.prod';
;

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  userInput = '';
  isLoading = false;
  isMinimized = false;

  messages: { text: string; isUser: boolean }[] = [];

  @ViewChild('conversationContainer') conversationContainer!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  toggleChat() {
    this.isMinimized = !this.isMinimized;
  
    // Only show welcome message once (when chat is first opened)
    if (!this.isMinimized && this.messages.length === 0) {
      this.messages.push({
        text: "Hello! I'm your Car Safety Assistant. How can I help you today?",
        isUser: false
      });
    }
  }
  

  sendMessage() {
    const message = this.userInput.trim();
    if (!message) return;

    this.messages.push({ text: message, isUser: true });
    this.userInput = '';
    this.isLoading = true;

    this.scrollToBottom();

    setTimeout(() => {
      this.callGeminiApi(message).subscribe({
        next: (response: any) => {
          const reply =
            response?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't understand that.";
          this.messages.push({ text: reply, isUser: false });
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Error:', err);
          this.messages.push({
            text: 'Sorry, I encountered an error. Please try again later.',
            isUser: false
          });
          this.isLoading = false;
        }
      });
    }, 500);
  }
  callGeminiApi(userMessage: string) {
    const apiKey = 'AIzaSyC-TDisQeajoEg1ucwtu2JCO_bsP2vYD70';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const lowerMessage = userMessage.toLowerCase();
  
    const greetings = ['hi', 'hello', 'hey', 'salut'];
    const servicesKeywords = ['service', 'services', 'what do you offer', 'what are your services'];
    const supportKeywords = ['contact', 'support', 'help', 'customer service'];
    const goodbyeKeywords = ['thank you', 'thanks', 'goodbye', 'bye', 'good night', 'see you', 'good day','okay','thats good','ok'];
  
    const carKeywords = ['car', 'accident', 'driver', 'road', 'safety', 'track', 'tire', 'vehicle', 'engine', 'drowsiness', 'speed', 'location','safety car', 'car safety'];
  
    // 1. Greeting
    if (greetings.includes(lowerMessage)) {
      return {
        subscribe: ({ next }: any) =>
          next({
            candidates: [{
              content: {
                parts: [{
                  text: "Hello! I'm your Safety Car Assistant. How can I help you today?"
                }]
              }
            }]
          })
      };
    }
  
    // 2. Services
    if (servicesKeywords.some(k => lowerMessage.includes(k))) {
      return {
        subscribe: ({ next }: any) =>
          next({
            candidates: [{
              content: {
                parts: [{
                  text: `We offer a suite of car safety services:\n- Drowsiness detection\n- Fingerprint-based driver ID\n- Real-time car location\n- Automatic accident alerts\n- AI destination guidance`
                }]
              }
            }]
          })
      };
    }
  
    // 3. Support
    if (supportKeywords.some(k => lowerMessage.includes(k))) {
      return {
        subscribe: ({ next }: any) =>
          next({
            candidates: [{
              content: {
                parts: [{
                  text: "You can reach our support team at **safetycar.help.contact@gmail.com** or **+216 29036348**."
                }]
              }
            }]
          })
      };
    }
  
    // 4. Goodbye / End Conversation
    if (goodbyeKeywords.some(k => lowerMessage.includes(k))) {
      return {
        subscribe: ({ next }: any) =>
          next({
            candidates: [{
              content: {
                parts: [{
                  text: "Thank you for chatting with Safety Car! Stay safe and have a great day 🚗✨"
                }]
              }
            }]
          })
      };
    }
  
    // 5. Check if message is car-related
    const isCarRelated = carKeywords.some(keyword => lowerMessage.includes(keyword));
    if (!isCarRelated) {
      return {
        subscribe: ({ next }: any) =>
          next({
            candidates: [{
              content: {
                parts: [{
                  text: "I'm here to help with car safety topics like accidents, drowsiness detection, vehicle tracking, and emergency alerts. Please ask a question related to your car or driving safety."
                }]
              }
            }]
          })
      };
    }
  
    // 6. Real Gemini API call (for car-related topics)
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ]
    };
  
    return this.http.post(apiUrl, body);
  }
  

  scrollToBottom() {
    setTimeout(() => {
      if (this.conversationContainer) {
        const element = this.conversationContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}