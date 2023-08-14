import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../environments/environment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';


interface UserProfileResponse {
  role: any;
  phoneNumber: any; 
  Profile: any;
  // ... cualquier otra propiedad que esperes
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
  // completarPerfil(data: any) {
  //   // En caso de que tu API espere el userId en la URL, modifica aquí:
  //   return this.http.post(`${environment.apiBaseUrl}/completarperfil/${data.userId}`, data);
  // }
  

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
    // Redirigir al home
    this.router.navigate(['/home']).then(() => {
        window.location.reload();
    });
}

  

}
