import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../environments/environment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';



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

export interface trackId {
  id: number;
  name: string;
  startCoord: string;
  endCoord: string;
  photo: string;
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

  getTrackId(id: number): Observable<trackId> {
    return this.http.get<trackId>(`${environment.apiBaseUrl}/pista/${id}`).pipe(
        catchError((error) => {
            console.error('Error fetching track ID:', error);
            return throwError(error); // Esto reemitirá el error para que puedas manejarlo en tu componente
        })
    );
}

  editCarGaraje(data: any, id: number) {
    return this.http.put(`${environment.apiBaseUrl}/editarvehiculo/${id}`, data);
}


  DeleteCarGaraje(data: any, id: number) {
    return this.http.delete(`${environment.apiBaseUrl}/eliminarvehiculo/${id}`, data);
  }
  getBlackList(): Observable<any[]> {
    return this.http.get<any[]>(`https://culture.apiimd.com/tablaDePosiciones`)
        .pipe(
            catchError(error => {
                console.error('Error al obtener la tabla de posiciones:', error);
                return throwError(error);
            })
        );
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
