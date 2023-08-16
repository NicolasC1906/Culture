import { Component, OnInit } from '@angular/core';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES_WITHOUT_TOKEN: RouteInfo[] = [
    { path: '/home', title: 'inicio',  icon: 'design_app', class: '' },
    { path: '/auth/login', title: 'Iniciar sesión',  icon:'users_single-02', class: '' },
    { path: '/auth/registro', title: 'Registro',  icon:'objects_spaceship', class: 'active active-pro' }
];

export const ROUTES_WITH_TOKEN: RouteInfo[] = [
    { path: '/home', title: 'inicio',  icon: 'design_app', class: '' },
    { path: '/user-profile', title: 'Perfil',  icon:'users_single-02', class: '' },
    { path: '/map-test', title: 'map-test',  icon:'location_map-big', class: '' },
    { path: '/event', title: 'Eventos',  icon:'ui-1_calendar-60', class: '' }

  ];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[];

  constructor() { }

  ngOnInit() {
    const token = localStorage.getItem('token');  // Asumiendo que el token se guarda bajo la clave 'token'
    if (token) {
      this.menuItems = ROUTES_WITH_TOKEN;
    } else {
      this.menuItems = ROUTES_WITHOUT_TOKEN;
    }
  }

  isMobileMenu() {
    if ( window.innerWidth > 991) {
      return false;
    }
    return true;
  }
}
