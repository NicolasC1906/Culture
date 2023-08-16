
import { DatePipe } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, HostListener, ElementRef  } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../../services/location.service';
import 'leaflet-routing-machine';
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
  public buttonText: string = 'Practicar pista';
  errorMessage: string;
  private map: L.Map;
  private userMarker: L.Marker;
  private userRadar: L.Circle;
  private startPoint: L.Marker;
  private endPoint: L.Marker;
  private routeControl: L.Routing.Control;

  cordenateinicio: any;
  cordenatefinal: any;
  inicio:any
  final:any
  datamap: any;
  distanciatotal: number;

  
  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private locationService: LocationService,
    private el: ElementRef,) {
    this.route.params.subscribe(params => {
      this.eventId = +params['id']; // El '+' convierte el string a número.
    });
   }
   @HostListener('window:scroll', ['$event'])
   onScroll(event) {
     const overlayContent = this.el.nativeElement.querySelector('.overlay-content');
     const scrollY = window.scrollY;
 
     overlayContent.style.transform = `translateY(${scrollY * 0.5}px)`; // Puedes ajustar el 0.5 para cambiar la velocidad del efecto
   }
 

  ngOnInit() {
    this.checkUserRegistration();
    this.route.params.subscribe(params => {
      const eventId = params['id']; // obtiene el 'id' de la URL
      
      this.http.get<Event[]>(`https://culture.apiimd.com/event/${eventId}`).subscribe(data => {
        this.event = data;
        this.comparaciondefecha();
        this.obtenerinfo();
      });
    });
    this.asistentesevent();
    this.pistasevento()
    
  }

  ngOnDestroy() {
    if (this.routeControl) {
        this.routeControl.remove();
    }
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
  obtenerinfo(){
      this.datamap = this.event
      console.log(this.datamap.startLocation)
      this.cordenateinicio = this.datamap.startLocation
      this.cordenatefinal = this.datamap.endLocation
      this.inicio = this.cordenateinicio.split(',')
      this.final = this.cordenatefinal.split(',')
      this.initMap();
  }
  
  
  private initMap(): void {
    this.map = L.map('map', {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    });
  
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'Drivy',
      maxZoom: 60,
      opacity: 1
    }).addTo(this.map);
  
    // Icono personalizado
    const iconUrl = './assets/img/icon_blank.png';
    const icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  
    // Definir el punto de inicio
    const pointA = L.latLng(this.inicio[0], this.inicio[1]);
  
    // Agregar marcador del punto de inicio al mapa
    this.startPoint = L.marker(pointA, { icon: icon })
    .addTo(this.map)
    .bindTooltip("Punto de Encuentro", {
      permanent: true, // Hace que la tooltip se muestre siempre, no solo al pasar el mouse por encima
      direction: 'right', // Puedes cambiarlo a 'top', 'bottom', 'left' según prefieras
      offset: L.point(10, 0) // Desplaza la tooltip respecto al marcador para que se ajuste como desees
    });  
    // Establecer el punto de vista del mapa al punto de inicio con un zoom específico
    this.map.setView(pointA, 17); // 15 es solo un valor de zoom de ejemplo, puedes ajustarlo según tus necesidades
  
    // Efecto de radar
    this.userRadar = L.circle([0, 0], {
      color: '#ff3636',
      fillColor: '#ff3636',
      fillOpacity: 0.5,
      radius: 500
    }).addTo(this.map);
  
    let isGrowing = true;
    this.userRadar['interval'] = setInterval(() => {
      let currentRadius = this.userRadar.getRadius();
      if (isGrowing) {
        this.userRadar.setRadius(currentRadius + 10);
      } else {
        this.userRadar.setRadius(currentRadius - 10);
      }
  
      if (currentRadius > 1000) isGrowing = false;
      if (currentRadius < 500) isGrowing = true;
    }, 50);
  }
  
}



