import { Component, OnInit, OnDestroy, HostListener, ElementRef  } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../../services/location.service';
import 'leaflet-routing-machine';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-track-detail',
  templateUrl: './track-detail.component.html',
  styleUrls: ['./track-detail.component.scss']
})
export class TrackDetailComponent {
  private map: L.Map;
  private userMarker: L.Marker;
  private userRadar: L.Circle;
  private startPoint: L.Marker;
  private endPoint: L.Marker;
  private routeControl: L.Routing.Control;

  private cordenateinicio: any;
  private cordenatefinal: any;
  datamap: any;
  distanciatotal: number;
  posiciones: any;
  vehiculos: any[] = [];
  showModal: boolean = false;

  
  constructor(
    private locationService: LocationService,
    private el: ElementRef,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    ) {}

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    const overlayContent = this.el.nativeElement.querySelector('.overlay-content');
    const scrollY = window.scrollY;

    overlayContent.style.transform = `translateY(${scrollY * 0.5}px)`; // Puedes ajustar el 0.5 para cambiar la velocidad del efecto
  }


  ngOnInit() {
    this.obtenerinfo();
    this.obtenertabladeposiciones()
  }

  ngOnDestroy() {
    if (this.routeControl) {
        this.routeControl.remove();
    }
}

obtenertabladeposiciones(){
  this.route.params.subscribe(params => {
    const idTrack = params['id']; // obtiene el 'id' de la URL
    
    this.http.get<Event[]>(`https://culture.apiimd.com/pista/${idTrack}/mejorestiempos`).subscribe((data:any) => {
      console.log(data)
      this.posiciones = data;
    });
  });
}
obtenerinfo(){
  this.route.params.subscribe(params => {
    const idTrack = params['id']; // obtiene el 'id' de la URL
    
    this.http.get<Event[]>(`https://culture.apiimd.com/pista/${idTrack}`).subscribe((data:any) => {
    this.datamap = data
    this.cordenateinicio = data.startCoord.split(',');
    this.cordenatefinal = data.endCoord.split(',');
    console.log(data)
    this.initMap();
    });
  });
}


  private initMap(): void {
    this.map = L.map('map', {
      zoomControl: false,
      dragging: true,           // Desactiva arrastrar el mapa
      touchZoom: true,          // Desactiva zoom con gestos táctiles
      scrollWheelZoom: false,    // Desactiva zoom con rueda del ratón
      doubleClickZoom: false,    // Desactiva zoom con doble clic
      boxZoom: false,            // Desactiva zoom con cuadro
      keyboard: false            // Desactiva controles con teclado
    }).setView([0, 0], 13);


    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'Drivy',
      maxZoom: 60,
      opacity: 1  // Establece la opacidad de las baldosas (0 es completamente transparente y 1 es completamente opaco)
     }).addTo(this.map);


    // Icono personalizado
    const iconUrl = './assets/img/icon_blank.png';
    const icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32], // puedes necesitar ajustar esto dependiendo del tamaño del ícono
      iconAnchor: [16, 16] // y esto también
    });
    this.userMarker = L.marker([0, 0], { icon: icon }).addTo(this.map);

    // Efecto de radar
    this.userRadar = L.circle([0, 0], {
      color: '#ff3636',
      fillColor: '#ff3636',
      fillOpacity: 0.5,
      radius: 500 // Este valor cambiará con el tiempo
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

    
    // Definir dos puntos
    const pointA = L.latLng(this.cordenateinicio[0], this.cordenateinicio[1]);  // Por ejemplo, coordenadas de Nueva York
    const pointB = L.latLng(this.cordenatefinal[0], this.cordenatefinal[1]);  // Por ejemplo, coordenadas de Los Ángeles

    // Agregar marcadores al mapa
    this.startPoint = L.marker(pointA, { icon: icon }).addTo(this.map);
    this.endPoint = L.marker(pointB).addTo(this.map);

    // Centrar el mapa para mostrar ambos puntos
    this.map.fitBounds(L.latLngBounds(pointA, pointB));

    // Dibujar ruta entre los puntos
    this.routeControl = L.Routing.control({
        waypoints: [pointA, pointB],
        show: false ,
        routeWhileDragging: true
    }).on('routesfound', (e: any) => {
        const routes = e.routes;
        const summary = routes[0].summary;
        this.distanciatotal = summary.totalDistance * 0.001
    }).addTo(this.map);
  }


  iniciarPista() {
    const userId = localStorage.getItem('idUser');

    if (userId) {
      this.http.get(`https://culture.apiimd.com/obtenergaraje/${userId}`).subscribe((res: any) => {
        if (res.length === 1) {
          this.procederConVehiculo(res[0].id);
        } else if (res.length > 1) {
          this.toastr.error('Selecciona un vehiculo para continuar');
          this.vehiculos = res;
          this.showModal = true;
        }
      });
    }
  }

  seleccionarVehiculo(id: string) {
    this.procederConVehiculo(id);
    this.showModal = false;
  }

  procederConVehiculo(idVehiculo: string) {
    localStorage.setItem('idVehiculo', idVehiculo);
    localStorage.setItem('idPista', this.getIdPistaFromURL());
    this.router.navigate(['/pista']);
  }

  getIdPistaFromURL(): string {
    const urlSegments = this.router.url.split('/');
    return urlSegments[urlSegments.length - 1];
  }
}