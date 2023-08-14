import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../auth/login/login.component';
import { RegistroComponent } from '../auth/registro/registro.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: '', redirectTo: 'registro', pathMatch: 'full' } // Esto asegura que la ruta predeterminada sea 'registro'.
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }
