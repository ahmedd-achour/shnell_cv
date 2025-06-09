import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../../src/environement';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { HomeComponent } from './home/home.component';
import { CvEditorComponent } from './cv-editor/cv-editor.component';
import { WebcamComponent } from './webcam/webcam.component';
import { RegistercarsComponent } from './registercars/registercars.component';
import { LiveComponent } from './live/live.component';
import { DashComponent } from './dash/dash.component';
import { SignupComponent } from './signup/signup.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { ProductsComponent } from './products/products.component';
import { AbonnementComponent } from './abonnement/abonnement.component';
import { ContactComponent } from './contact/contact.component';
import { ServiceComponent } from './service/service.component';
import { AboutComponent } from './about/about.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    HomeComponent,
    CvEditorComponent,
    WebcamComponent,
    RegistercarsComponent,
    LiveComponent,
    DashComponent,
    SignupComponent,
    ChatbotComponent,
    ProductsComponent,
    AbonnementComponent,
    ContactComponent,
    ServiceComponent,
    AboutComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgChartsModule,


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }







