import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

const routes: Routes =[
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  }, 
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
        {
          path: '',
          loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x=>x.AdminLayoutModule)
        }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)  // Carga perezosa del módulo de autenticación
  },
  {
    path: '**',
    redirectTo: 'home'
  }
]; 

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
