import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Model1Component } from './model-1/model-1.component';
import { Model2Component } from './model-2/model-2.component';
import { Model3Component } from './model-3/model-3.component';
import { HomeComponent } from './home/home.component';
import { CvEditorComponent } from './cv-editor/cv-editor.component';
import { Model4Component } from './model4/model4.component';
import { WebcamComponent } from './webcam/webcam.component';

const routes: Routes = [
  {
    path: "1/:idref",  // Dynamic route with idref
    component: Model1Component
  },
  {
    path : "create" , component: Model4Component
  },
  {
    path: "2/:idref",
    component: Model2Component
  },
  {
    path: "3/:idref",
    component: Model3Component
  },

  {
    path: "",
    component: HomeComponent, pathMatch: 'full'

  },{
    path : "trash" , component : WebcamComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
