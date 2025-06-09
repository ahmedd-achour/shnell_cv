import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../../src/environement';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any; // Or a more specific type if available

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Choose your model
  }

  async sendMessage(message: string, chat?: any) {
    try {
      if (chat) {
        const result = await chat.sendMessage(message);
        return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        const result = await this.model.generateContent(message);
        return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (error: any) {
      console.error('Error sending message to Gemini:', error);
      return 'Sorry, I encountered an error.';
    }
  }
  

  startNewChat() {
    return this.model.startChat();
  }
}