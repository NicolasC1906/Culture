import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../environments/environment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';


interface UserProfileResponse {
  Garages: any;
  role: any;
  phoneNumber: any;
  Profile: any;
  // ... cualquier otra propiedad que esperes
}

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  photo: string;
  createdAt: string;
  updatedAt: string;
  UserId: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  constructor(private http: HttpClient,  private router: Router) { }

  registerUser(phoneNumber: string, password: string) {
    const body = {
      phoneNumber: phoneNumber,
      password: password
    };
    return this.http.post(`${environment.apiBaseUrl}/registro`, body);
  }

  loginUser(phoneNumber: string, password: string) {
    const body = {
      phoneNumber: phoneNumber,
      password: password
    };
    return this.http.post(`${environment.apiBaseUrl}/login`, body);
  }

  getUsuarioProfile(id: number): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${environment.apiBaseUrl}/usuario/${id}`);
  }

  completarPerfil(data: any) {
    return this.http.post(`${environment.apiBaseUrl}/completarperfil`, data);
  }

  crearGaraje(data: any, id: number) {
    return this.http.post(`${environment.apiBaseUrl}/agregarvehiculo/${id}`, data);
  }

  getUsuarioGaraje(id: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${environment.apiBaseUrl}/obtenergaraje/${id}`);
  }


  editCarGaraje(data: any, id: number) {
    return this.http.put(`${environment.apiBaseUrl}/editarvehiculo/${id}`, data);
  }

  DeleteCarGaraje(data: any, id: number) {
    return this.http.delete(`${environment.apiBaseUrl}/editarvehiculo/${id}`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('idUser');
    // Redirigir al home
    this.router.navigate(['/home']).then(() => {
        window.location.reload();
    });
}



}
