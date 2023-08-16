import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private http: HttpClient, private route: ActivatedRoute) {
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

  asistentesevent(): void {
    this.http.get<Event[]>(`https://culture.apiimd.com/getUsersOfEvent/${this.eventId}`).subscribe((data:any) => {
        this.usersevent = data.users;
        console.log(this.usersevent)
      });
  }
  pistasevento(): void {
    this.http.get<Event[]>(`https://culture.apiimd.com/clues/event/${this.eventId}`).subscribe((data:any) => {
        this.pistasevent = data;
        console.log(this.pistasevent)
      });
  }
}


