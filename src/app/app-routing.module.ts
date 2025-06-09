import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { RegistercarsComponent } from './registercars/registercars.component';
import { LiveComponent } from './live/live.component';
import { SigninComponent } from './signin/signin.component';
import { AuthGuard } from './auth.guard';

import { SignupComponent } from './signup/signup.component';
import { ProductsComponent } from './products/products.component';
import { AbonnementComponent } from './abonnement/abonnement.component';
import { ContactComponent } from './contact/contact.component';
import { ServiceComponent } from './service/service.component';
import { AboutComponent } from './about/about.component';
import { ChatbotComponent } from './chatbot/chatbot.component';

const routes: Routes = [{
    path: "cars" , component: RegistercarsComponent, canActivate: [AuthGuard] 
  },
  {
    path: "live" , component: LiveComponent
  },
  {
    path: "home" , component: HomeComponent
  },
  {
    path: "signin", component: SigninComponent
  },
  {
    path: "signupes", component: SignupComponent 
  },
  {
    path: "contact", component: ContactComponent 
  },
  {
    path: "service", component: ServiceComponent 
  },
  {
    path: "about", component: AboutComponent 
  }, {
    path: "chat", component: ChatbotComponent 
  },
  { path: '', component: HomeComponent },

    {
      path: "",
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: "products" , component: ProductsComponent, canActivate: [AuthGuard] 
    },
    {
      path: "abonnement" , component: AbonnementComponent, canActivate: [AuthGuard] 
    },
  




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



