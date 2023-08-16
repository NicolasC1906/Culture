import { Component } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss']
})
export class TracksComponent {
  events: any = [];
  posiciones: Event[];

  constructor(config: NgbCarouselConfig, private http: HttpClient, private router: Router) {
    config.interval = 5000;
    config.keyboard = true;
    config.pauseOnHover = true;
  }

  ngOnInit() {
    this.tabladeposiciones()
    const today = new Date();
    const releaseDate = new Date(2023, 7, 19);  // Recuerda que los meses van de 0 a 11.
  
     if (today < releaseDate) {
       alert('Gran lanzamiento de pistas el 19 de agosto!');
       this.router.navigate(['/']);  // Redirecciona al inicio.
       return;
     }
  
    // Si no es antes del 19 de agosto, continúa con la lógica normal de cargar los eventos.
    this.http.get<Event[]>('https://culture.apiimd.com/pistas').subscribe(data => {
      this.events = data;
      console.log(this.events);
    });
  }

  tabladeposiciones():void {
    this.http.get<Event[]>('https://culture.apiimd.com/tablaDePosiciones').subscribe(data => {
      this.posiciones = data;
      console.log(this.posiciones);
    });
  }
}
