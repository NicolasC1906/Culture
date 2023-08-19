import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { LocationService } from '../../services/location.service';
import { ToastrService } from 'ngx-toastr';
import { RegistroService } from '../../services/registro.service';
import NoSleep from 'nosleep.js';
import { TimingService } from '../../services/timing.service';

@Component({
  selector: 'app-map-track',
  templateUrl: './map-track.component.html',
  styleUrls: ['./map-track.component.scss']
})
export class MapTrackComponent implements OnInit, OnDestroy {
  private map: L.Map;
  private userMarker: L.Marker;
  private userRadar: L.Circle;
  private endRadar: L.Circle; // Radar para el punto final
  private realUserMarker: L.Marker; // Marcador para el usuario real
  private realUserRadar: L.Circle; // Radar para el usuario real

//Logica - gps-test
public currentLatitude: number = 0;
public currentLongitude: number = 0;

public currentSpeed: number = 0; // en m/s
public currentSpeedKph: number = 0; // en km/h
public rotationAngle: number = 0;
public speedRecords: number[] = []; // Almacenará todas las velocidades registradas en km/h
private lastLocation: L.LatLng | null = null;


private startPointMarker: L.Marker | null = null;
private endPointMarker: L.Marker | null = null;
private currentLocationMarker: L.Marker | null = null;
private routePolyline: L.Polyline | null = null; // Campo para la polilínea
private route: L.GeoJSON<GeoJSON.LineString> | null = null; // Ruta GeoJSON

private startCoordinate = [];
private endCoordinate = [];

public distanceToStart: number = 0; // Distancia al punto de inicio en metros
public distanceToIntermediate: number = 0; // Distancia al punto intermedio en metros
public distanceToEnd: number = 0; // Distancia al punto final en metros
public totalDistance: any;
public isStartPointSet: boolean = false;
public isEndPointSet: boolean = false;
private noSleep: any;

//Logica - gps-test end
private showRouteInfoAsPopup(lat: number, lng: number, minutes: number, distance: string): void {
  L.popup()
    .setLatLng([lat, lng])
    .setContent(`Tiempo estimado: ${minutes} min<br>Distancia: ${distance} km`)
    .openOn(this.map);
}

private getMidpoint(lat1: number, lon1: number, lat2: number, lon2: number): [number, number] {
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lon1 + lon2) / 2;
  return [midLat, midLng];
}

  tokenExists: boolean = false;

  constructor(
    private locationService: LocationService,
    private toastr: ToastrService,
    private registroService: RegistroService,
    public timingService: TimingService,
  ) {
    this.noSleep = new NoSleep();
    this.totalDistance = 0;
   }

   @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    $event.returnValue = true;
  }
  ngOnInit() {
    this.noSleep.enable();
    this.tokenExists = !!localStorage.getItem('token');
      // Inicializa o borra las variables relacionadas a las velocidades y el tiempo.
   localStorage.removeItem('startSpeed');
   localStorage.removeItem('endSpeed');
   localStorage.removeItem('averageSpeed');
   localStorage.removeItem('maxSpeed');
   localStorage.removeItem('startTime');
   localStorage.removeItem('timeTaken');
   localStorage.removeItem('startDate');
   localStorage.removeItem('endDate');
  }

  ngAfterViewInit() {
    // Configura el marcador para que no muestre el ícono predeterminado.
    const noIcon = L.divIcon({
      className: 'custom-icon',
      html: '',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, 0],
      tooltipAnchor: [0, 0]
    });

    L.Marker.prototype.options.icon = noIcon;

    // Luego continúa con el resto de la funcionalidad que ya tenías.
    this.fetchTrackCoordinates();
    // Comenzar a rastrear la ubicación del usuario
    this.locationService.watchLocation((speed, timestamp, latitude, longitude) => {
      this.updateRealUserLocation(latitude, longitude);
    }, (error) => {
      this.toastr.error(error);
    });
  }

  ngOnDestroy() {
    this.locationService.stopWatching();
    if (this.userRadar) {
      clearInterval(this.userRadar['interval']);
    }
    if (this.endRadar) {
      clearInterval(this.endRadar['interval']);
    }
    if (this.realUserRadar) {
      clearInterval(this.realUserRadar['interval']); // Detener la animación del radar del usuario real
    }
    this.noSleep.disable();
  }


  private initMap(initialLocation: L.LatLng): void {
    this.map = L.map('map', {
      zoomControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: false
    }).setView([initialLocation.lat, initialLocation.lng], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'Drivy',
      maxZoom: 60,
      opacity: 1
    }).addTo(this.map);

    const iconUrl = './assets/img/icon_blank.png';
    const icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    this.userMarker = L.marker([initialLocation.lat, initialLocation.lng], { icon: icon }).addTo(this.map);

    this.userRadar = L.circle([initialLocation.lat, initialLocation.lng], {
      color: '#ff3636',
      fillColor: '#ff3636',
      fillOpacity: 0.5,
      radius: 100
    }).addTo(this.map);

    let isGrowing = true;
    this.userRadar['interval'] = setInterval(() => {
        let currentRadius = this.userRadar.getRadius();
        if (isGrowing) {
            this.userRadar.setRadius(currentRadius + 10);
        } else {
            this.userRadar.setRadius(currentRadius - 10);
        }

        if (currentRadius > 400) isGrowing = false; // Cambiado a 400 desde 1000
        if (currentRadius < 200) isGrowing = true;  // Cambiado a 200 desde 500
    }, 50);

    this.locationService.watchLocation((speed, timestamp, latitude, longitude) => {
      // console.log("Speed:", speed);
      this.currentLatitude = latitude;
      this.currentLongitude = longitude;
      this.currentSpeed = speed;
      this.currentSpeedKph = speed * 3.6;
      this.rotationAngle = this.currentSpeedKph;// Convertir de m/s a km/h
      this.speedRecords.push(this.currentSpeedKph);

      this.distanceToStart = this.calculateDistance(latitude, longitude, this.startCoordinate[0], this.startCoordinate[1]);
      this.distanceToEnd = this.calculateDistance(latitude, longitude, this.endCoordinate[0], this.endCoordinate[1]);

      if (this.currentLocationMarker) {
        this.currentLocationMarker.setLatLng(new L.LatLng(latitude, longitude));
      } else {
        if (this.map) {
          this.currentLocationMarker = L.marker([latitude, longitude]).addTo(this.map);
          this.currentLocationMarker.bindPopup('Ubicación actual').openPopup();
        }

      }
       // Aquí es donde actualizamos el centro del mapa


      if (this.timingService.startPoint && !this.timingService.endPoint) {
        if (this.routePolyline) {
          this.routePolyline.addLatLng(new L.LatLng(latitude, longitude));
        } else {
          if (this.map) {
            this.routePolyline = L.polyline([[latitude, longitude]], {color: 'red'}).addTo(this.map);
          }
        }
      }
      const currentLocation = new L.LatLng(latitude, longitude);
      if (this.lastLocation) {
          const distance = currentLocation.distanceTo(this.lastLocation);
          this.totalDistance += distance;
      }
      this.lastLocation = currentLocation;
      const tolerance = 15;
      const toleranceEnd = 15;
      const distanceToStart = this.calculateDistance(latitude, longitude, this.startCoordinate[0] , this.startCoordinate[1]);
      console.log("distanceToStart",distanceToStart)
      const distanceToEnd = this.calculateDistance(latitude, longitude, this.endCoordinate[0], this.endCoordinate[1]);

      if (distanceToStart < tolerance) {
        this.setStartPoint()
        console.log('Pasando por el punto de inicio.');
        localStorage.setItem('startSpeed', this.currentSpeedKph.toString());
        const currentDate = new Date();
        const dateString = currentDate.toISOString();
        localStorage.setItem('startDate', dateString);


      }


      if (distanceToEnd < toleranceEnd) {
        this.setEndPoint()
        console.log('Pasando por el punto final.');
        localStorage.setItem('endSpeed', this.currentSpeedKph.toString());
          const averageSpeed = this.speedRecords.reduce((acc, curr) => acc + curr, 0) / this.speedRecords.length;
          const maxSpeed = Math.max(...this.speedRecords);
          localStorage.setItem('averageSpeed', averageSpeed.toString());
          localStorage.setItem('maxSpeed', maxSpeed.toString());
          const startTime = parseFloat(localStorage.getItem('startTime') || '0');
          const endTime = Date.now(); // Obtenemos el tiempo actual en milisegundos
          const timeTaken = (endTime - startTime) / 1000; // Tiempo en segundos
          localStorage.setItem('timeTaken', timeTaken.toString());
          const currentDate = new Date();
          const dateString = currentDate.toISOString();
          localStorage.setItem('endDate', dateString);
      }

    }, (error) => {
      console.error(error);
    });

  }

  private updateUserLocation(lat: number, lon: number): void {
    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lon]);
    } else {
      this.userMarker = L.marker([lat, lon]).addTo(this.map);
    }

    if (this.userRadar) {
      this.userRadar.setLatLng([lat, lon]);
    }

    this.map.setView([lat, lon], 13);
  }

  private plotRoute(startCoords: [number, number], endCoords: [number, number]): void {
    const iconUrl = './assets/img/icon_blank.png';
    const icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker(endCoords, { icon: icon }).addTo(this.map);
    this.initEndRadarEffect(L.latLng(endCoords[0], endCoords[1])); // Inicializa el efecto de radar para el punto final

    L.Routing.control({
      waypoints: [
        L.latLng(startCoords[0], startCoords[1]),
        L.latLng(endCoords[0], endCoords[1])
      ],
      routeWhileDragging: false,
      show: false
    }).addTo(this.map);
  }

  private initEndRadarEffect(location: L.LatLng): void {
    this.endRadar = L.circle([location.lat, location.lng], {
      color: '#ff3636',
      fillColor: '#ff3636',
      fillOpacity: 0.5,
      radius: 100
    }).addTo(this.map);

    let isGrowing = true;
    this.endRadar['interval'] = setInterval(() => {
      let currentRadius = this.endRadar.getRadius();
      if (isGrowing) {
        this.endRadar.setRadius(currentRadius + 10);
      } else {
        this.endRadar.setRadius(currentRadius - 10);
      }

      if (currentRadius > 400) isGrowing = false;
      if (currentRadius < 200) isGrowing = true;
    }, 50);
  }


private updateRealUserLocation(lat: number, lon: number): void {
  const userIconUrl = './assets/img/car-marker.png'; // Cambia esto por la ruta de tu ícono del usuario
  const userIcon = L.icon({
    iconUrl: userIconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  if (!this.realUserMarker) {
    this.realUserMarker = L.marker([lat, lon], { icon: userIcon }).addTo(this.map);
  } else {
    this.realUserMarker.setLatLng([lat, lon]);
  }

  if (!this.realUserRadar) {
    this.realUserRadar = L.circle([lat, lon], {
      color: '#3366ff', // Color azul para el radar del usuario
      fillColor: '#3366ff',
      fillOpacity: 0.5,
      radius: 100
    }).addTo(this.map);

    // Efecto de animación para el radar del usuario
    let isGrowing = true;
    this.realUserRadar['interval'] = setInterval(() => {
      let currentRadius = this.realUserRadar.getRadius();
      if (isGrowing) {
        this.realUserRadar.setRadius(currentRadius + 10);
      } else {
        this.realUserRadar.setRadius(currentRadius - 10);
      }

      if (currentRadius > 400) isGrowing = false;
      if (currentRadius < 200) isGrowing = true;
    }, 50);

  } else {
    this.realUserRadar.setLatLng([lat, lon]);
  }
}




private fetchTrackCoordinates(): void {
  const trackId = localStorage.getItem('idPista');

  if (trackId) {
    this.registroService.getTrackId(+trackId).subscribe(trackData => {
      if (trackData) {
        // Mostrar el nombre del track en el HTML
        document.getElementById('trackNameDisplay').textContent = trackData.name;

        const coordsArray = trackData.startCoord.split(',').map(coord => parseFloat(coord.trim()));
        const startCoords: [number, number] = [coordsArray[0], coordsArray[1]];

        const endCoordsArray = trackData.endCoord.split(',').map(coord => parseFloat(coord.trim()));
        const endCoords: [number, number] = [endCoordsArray[0], endCoordsArray[1]];

        this.initMap(L.latLng(startCoords[0], startCoords[1]));
        this.updateUserLocation(startCoords[0], startCoords[1]);
        this.plotRoute(startCoords, endCoords);
        this.startCoordinate = startCoords
        this.endCoordinate = endCoords
        this.noSleep.enable();
      }
    });
  } else {
    this.toastr.error('No se encontró el ID de la pista');
  }
}





  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    var R = 6371; // Radio de la tierra en km
    var dLat = this.deg2rad(lat2 - lat1);  // Conversión de grados a radianes
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distancia en km
    return d * 1000; // Distancia en metros
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  showSimpleNotification(message: string, from: string, align: string) {
    this.toastr.info(message, '', {
        timeOut: 8000,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-info alert-with-icon",
        positionClass: 'toast-' + from + '-' + align
    });
}

  setStartPoint(): void {
    if (this.isStartPointSet) {
      return;  // Salir si el punto de inicio ya ha sido establecido.
    }
    // Play the start audio
    const startAudio = new Audio('assets/sound/start.mp3');
    this.showSimpleNotification("Iniciaste la ruta", "bottom", "center");
    startAudio.play();
    startAudio.play().catch(error => {
      console.error("Error al reproducir el audio:", error);
      this.noSleep.enable();
  });

    // Set the start point using predefined coordinates
    this.timingService.setStartPoint(this.startCoordinate[0], this.startCoordinate[1]);

    if (this.map) {
      this.startPointMarker = L.marker([this.startCoordinate[0], this.startCoordinate[1]]).addTo(this.map);
      this.startPointMarker.bindPopup('Punto de inicio').openPopup();
    }
    this.isStartPointSet = true;
    this.isEndPointSet = false;
}


setEndPoint(): void {
  // Play the end audio
  if (this.isEndPointSet) {
    return;
  }
  const endAudio = new Audio('assets/sound/end.mp3');
  this.showSimpleNotification("Pasaste por el punto Final", "top", "center");
  endAudio.play();
  endAudio.play().catch(error => {
    console.error("Error al reproducir el audio:", error);
    this.noSleep.enable();
});


  // Set the end point using predefined coordinates
  this.timingService.setEndPoint(this.endCoordinate[0], this.endCoordinate[1]);

  if (this.map) {
    this.endPointMarker = L.marker([this.endCoordinate[0], this.endCoordinate[1]]).addTo(this.map);
    this.endPointMarker.bindPopup('Punto final').openPopup();
  }
  this.isStartPointSet = false;
  this.isEndPointSet = true;
}


  public getAverageSpeed(): number {
    if (!this.speedRecords.length) {
      return 0;
    }

    const sum = this.speedRecords.reduce((a, b) => a + b, 0);
    return sum / this.speedRecords.length;
  }

  public getMaxSpeed(): number {
    if (!this.speedRecords.length) {
      return 0;
    }

    return Math.max(...this.speedRecords);
  }
  get averageSpeed(): number {
    return this.getAverageSpeed();
  }

  get maxSpeed(): number {
    return this.getMaxSpeed();
  }


  reset() {
    this.timingService.reset();

    if (this.startPointMarker) this.startPointMarker.remove();
    if (this.endPointMarker) this.endPointMarker.remove();

    if (this.routePolyline) {
      this.routePolyline.remove();
      this.routePolyline = null;
    }
    this.isStartPointSet = false;
    this.isEndPointSet = false;
  }
  playPointSound(): void {
    const pointAudio = new Audio('assets/sound/point.mp3');
    pointAudio.play();
  }



}
