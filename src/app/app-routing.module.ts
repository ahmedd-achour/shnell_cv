import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Model1Component } from './model-1/model-1.component';
import { Model2Component } from './model-2/model-2.component';
import { Model3Component } from './model-3/model-3.component';
import { HomeComponent } from './home/home.component';
import { CvEditorComponent } from './cv-editor/cv-editor.component';

const routes: Routes = [
  {
    path: "model_1/:idref",  // Dynamic route with idref
    component: Model1Component
  },
  {
    path: "model_2/:idref",
    component: Model2Component
  },
  {
    path: "model_3/:idref",
    component: Model3Component
  },
  {
path: "edit" , component: CvEditorComponent
  },
  {
    path: "",
    component: HomeComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
