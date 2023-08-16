import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-info-event',
  templateUrl: './info-event.component.html',
  styleUrls: ['./info-event.component.scss']
})
export class InfoEventComponent {
  event: any;
  private apiUrl: string = 'https://culture.apiimd.com/addUserToEvent';
  public eventId: number;
  public isRegistered: boolean;
  private checkUrl: string = 'https://culture.apiimd.com/isUserRegistered';
  usersevent: any;
  pistasevent: any;
  public buttonText: string = 'Practicar pista';
  errorMessage: string;

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute,
    private datePipe: DatePipe) {
    this.route.params.subscribe(params => {
      this.eventId = +params['id']; // El '+' convierte el string a número.
    });
   }


  ngOnInit() {
    this.checkUserRegistration();
    this.route.params.subscribe(params => {
      const eventId = params['id']; // obtiene el 'id' de la URL
      
      this.http.get<Event[]>(`https://culture.apiimd.com/event/${eventId}`).subscribe(data => {
        this.event = data;
        this.comparaciondefecha();
      });
    });
    this.asistentesevent();
    this.pistasevento()

  }

  checkUserRegistration(): void {
    const userId = localStorage.getItem('idUser');

    if (userId) {
      this.http.get<{ isRegistered: boolean }>(`${this.checkUrl}/${userId}/${this.eventId}`).subscribe(response => {
        console.log(response)
        this.isRegistered = response.isRegistered;
      }, error => {
        console.error("Error al verificar registro: ", error);
      });
    } else {
      console.error('Error al obtener userId del localStorage.');
    }
  }

  onRegisterClick(): void {
    console.log("inicio el registro del usuario")
    const userId = localStorage.getItem('idUser');
    
    if (userId) {
      console.log("peticion procesandose")
      this.http.post(this.apiUrl, {
        userId: userId,
        eventId: this.eventId
      }).subscribe((response:any) => {
        if (response.message === 'Usuario añadido al evento!') {
          alert('Te esperamos en el evento, gracias por inscribirte!');
          this.isRegistered = true;
        }
      });
    } else {
      alert('Sesion expirada intenta iniciar sesion de nuevo');
    }
  }
  obteniendoinfo(): void {
    this.usersevent.forEach(user => {

      this.http.get<Event[]>(`https://culture.apiimd.com/posicionUsuario/${user.id}`).subscribe((posicionData:any) => {
        console.log(posicionData)
        user.posicion = posicionData.position;  // Adapta esta línea según la respuesta de la API

        this.http.get<Event[]>(`https://culture.apiimd.com/puntosUsuario/${user.id}`).subscribe((puntosData:any) => {
        console.log(puntosData)  
        user.puntos = puntosData.puntos; // Adapta esta línea según la respuesta de la API
        });
      });
    });
  }
  asistentesevent(): void {
    this.http.get<Event[]>(`https://culture.apiimd.com/getUsersOfEvent/${this.eventId}`).subscribe((data:any) => {
        this.usersevent = data.users;
        this.obteniendoinfo()
      });
  }
  pistasevento(): void {
    this.http.get<Event[]>(`https://culture.apiimd.com/clues/event/${this.eventId}`)
      .pipe(
        catchError((error: any) => {
          if (error.status === 404) {
            this.errorMessage = 'No hay pistas registradas para este evento';
          } else {
            this.errorMessage = 'Ocurrió un error al cargar las pistas'; // Puedes adaptar este mensaje para otros errores si lo deseas
          }
          return error;
        })
      )
      .subscribe((data: any) => {
        this.errorMessage = "Te mostramos el orden de las pistas segun el evento"
        this.pistasevent = data;
        console.log(this.pistasevent);
      });
  }
  comparaciondefecha(): void {
    const currentDate = new Date();
    const eventDate = new Date(this.event.fecha);

    if (this.datePipe.transform(currentDate, 'yyyy-MM-dd') === this.datePipe.transform(eventDate, 'yyyy-MM-dd')) {
      this.buttonText = 'Correr pista';
    }
  }
}


