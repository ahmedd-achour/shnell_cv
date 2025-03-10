import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Model1Component } from './model-1/model-1.component';
import { Model2Component } from './model-2/model-2.component';
import { Model3Component } from './model-3/model-3.component';
import { HomeComponent } from './home/home.component';
import {  importProvidersFrom } from '@angular/core';
import { environment } from 'src/environement';
import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CvEditorComponent } from './cv-editor/cv-editor.component';
import { Model4Component } from './model4/model4.component';
import { WebcamComponent } from './webcam/webcam.component';

@NgModule({
  declarations: [
    AppComponent,
    Model1Component,
    Model2Component,
    Model3Component,
    HomeComponent,
    CvEditorComponent,
    Model4Component,
    WebcamComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideFirestore(() => getFirestore()),
    ]),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
