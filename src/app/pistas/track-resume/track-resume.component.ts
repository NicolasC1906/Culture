import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Importa el servicio Router

@Component({
  selector: 'app-track-resume',
  templateUrl: './track-resume.component.html',
  styleUrls: ['./track-resume.component.scss']
})
export class TrackResumeComponent implements OnInit {

  idUser: string;
  Tiempo: string;
  trackId: string;
  IdVehiculo: string;
  VelMax: string;
  VelPromedio: string;
  startCoordTime: string;
  endCoordTime: string;
  username: string;
  Idevent: string;
  tracks: any[] = [];
  evento: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router) { }

  ngOnInit(): void {
    this.getDataFromLocalStorage();
    this.fetchUsername();
    this.checkEventAndTracks();
  }

  getDataFromLocalStorage(): void {
    this.idUser = localStorage.getItem('idUser');
    this.Tiempo = localStorage.getItem('timeTaken');
    this.trackId = localStorage.getItem('idPista');
    this.IdVehiculo = localStorage.getItem('IdVehiculo');
    this.VelMax = localStorage.getItem('maxSpeed');
    this.VelPromedio = localStorage.getItem('averageSpeed');
    this.startCoordTime = localStorage.getItem('startDate');
    this.endCoordTime = localStorage.getItem('endDate');
    this.Idevent = localStorage.getItem('Idevent');
    
  }
  checkEventAndTracks(): void {
    if (this.Idevent) {
      this.http.get(`https://culture.apiimd.com/event/${this.Idevent}`).subscribe((eventResponse: any) => {
        if (eventResponse && eventResponse.Clues && eventResponse.Clues.length) {
          this.http.get<boolean>(`https://culture.apiimd.com/isUserRegistered/${this.idUser}/${this.Idevent}`).subscribe(isRegistered => {
            if (isRegistered) {
              const currentTrack = eventResponse.Clues.find(clue => clue.trackId === +this.trackId);

              if (currentTrack) {
                this.evento = true;
                const currentOrder = currentTrack.order;
                this.tracks = eventResponse.Clues.filter(clue => clue.order > currentOrder);
                console.log(this.tracks)

                // En este punto, "this.tracks" contendrá solo las pistas con un "order" mayor al actual.
              }
            }else{"No registrado al evento"}
          });
        } else {
          console.log("Sin Pistas");
        }
      });
    }
}

  fetchUsername(): void {
    if (this.idUser) {
      this.http.get(`https://culture.apiimd.com/usuario/${this.idUser}`).subscribe((response: any) => {
        this.username = response.Profile.username;
      });
    }
  }

  sendTrackData(): void {
    const data = {
      username: this.username,
      vehicleId: this.IdVehiculo,
      startCoordTime: this.startCoordTime,
      endCoordTime: this.endCoordTime,
      time: this.Tiempo,
      maxSpeed: this.VelMax,
      avgSpeed: this.VelPromedio
    };

    this.http.post(`https://culture.apiimd.com/pista/${this.trackId}/tiempo`, data).subscribe((response) => {
      console.log('Data sent successfully!', response);
    });
  }

  goToNextTrack(): void {
    // Cambiar el nombre actual de 'trackId' a 'trackIdOld'
    const currentTrackId = localStorage.getItem('idPista');
    localStorage.setItem('trackIdOld', currentTrackId);
    localStorage.removeItem('idPista');

    // Obtener la siguiente pista según el orden
    if (this.tracks && this.tracks.length > 0) {
      // Suponiendo que las pistas ya están ordenadas por "order", la primera pista en "this.tracks" será la siguiente.
      const nextTrack = this.tracks[0];
      localStorage.setItem('idPista', nextTrack.trackId.toString());

      // Redirigir al usuario a la dirección '/map-track'
      this.router.navigate(['/map-track']);
    }
  }
}