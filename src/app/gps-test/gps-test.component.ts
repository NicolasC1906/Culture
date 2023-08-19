import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocationService } from '../../services/location.service';
import * as L from 'leaflet';
import { GeoJSON } from 'leaflet';
import { TimingService } from '../../services/timing.service';
import 'leaflet-routing-machine';
import NoSleep from 'nosleep.js';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-gps-test',
  templateUrl: './gps-test.component.html',
  styleUrls: ['./gps-test.component.scss']
})
export class GpsTestComponent implements OnInit, OnDestroy {



  public currentLatitude: number = 0;
  public currentLongitude: number = 0;

  public currentSpeed: number = 0; // en m/s
  public currentSpeedKph: number = 0; // en km/h
  public speedRecords: number[] = []; // Almacenará todas las velocidades registradas en km/h
  private lastLocation: L.LatLng | null = null;


  private map: L.Map | null = null;
  private startPointMarker: L.Marker | null = null;
  private endPointMarker: L.Marker | null = null;
  private currentLocationMarker: L.Marker | null = null;
  private routePolyline: L.Polyline | null = null; // Campo para la polilínea
  private route: L.GeoJSON<GeoJSON.LineString> | null = null; // Ruta GeoJSON

  private startCoordinate = [-74.0837406, 4.5468784];
  private intermediateCoordinate = [-74.08502912042614, 4.561155403254483];
  private endCoordinate = [-74.08437241850753, 4.547184527750056];

  public distanceToStart: number = 0; // Distancia al punto de inicio en metros
  public distanceToIntermediate: number = 0; // Distancia al punto intermedio en metros
  public distanceToEnd: number = 0; // Distancia al punto final en metros
  public totalDistance: any;
  public isStartPointSet: boolean = false;
  public isEndPointSet: boolean = false;
  private noSleep: any;




  constructor(public timingService: TimingService, private locationService: LocationService, private toastr: ToastrService) {
    this.noSleep = new NoSleep();
     this.totalDistance = 0;
  }

  ngOnInit(): void {
    this.noSleep.enable();
    localStorage.removeItem('timingData');
    // Corrige el enlace a las imágenes de los marcadores

    const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png';
    const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png';
    const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map(document.querySelector('.gps-map') as HTMLElement).setView([this.currentLatitude, this.currentLongitude], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 3.25,

  }).addTo(this.map);
   // Utiliza el complemento para trazar la ruta
  L.Routing.control({
      waypoints: [
          L.latLng(this.startCoordinate[1], this.startCoordinate[0]), // Punto A
          L.latLng(this.endCoordinate[1], this.endCoordinate[0])     // Punto B
      ],
      routeWhileDragging: true,
      show: false ,
  }).addTo(this.map);

    // Configura la ruta  aquí (si se desea)


    this.locationService.watchLocation((speed, timestamp, latitude, longitude) => {
      // console.log("Speed:", speed);
      this.currentLatitude = latitude;
      this.currentLongitude = longitude;
      this.currentSpeed = speed;
      this.currentSpeedKph = speed * 3.6; // Convertir de m/s a km/h
      this.speedRecords.push(this.currentSpeedKph);

      this.distanceToStart = this.calculateDistance(latitude, longitude, this.startCoordinate[1], this.startCoordinate[0]);
      this.distanceToIntermediate = this.calculateDistance(latitude, longitude, this.intermediateCoordinate[1], this.intermediateCoordinate[0]);
      this.distanceToEnd = this.calculateDistance(latitude, longitude, this.endCoordinate[1], this.endCoordinate[0]);

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
      const tolerance = 5;
      const toleranceEnd = 10;
      const distanceToStart = this.calculateDistance(latitude, longitude, this.startCoordinate[1], this.startCoordinate[0]);
      console.log("distanceToStart",distanceToStart)
      const distanceToIntermediate = this.calculateDistance(latitude, longitude, this.intermediateCoordinate[1], this.intermediateCoordinate[0]);
      const distanceToEnd = this.calculateDistance(latitude, longitude, this.endCoordinate[1], this.endCoordinate[0]);

      if (distanceToStart < tolerance) {
        this.setStartPoint()
        console.log('Pasando por el punto de inicio.');

      }

      if (distanceToIntermediate < tolerance) {
        console.log('Pasando por el punto intermedio.');
        this.playPointSound();
      }

      if (distanceToEnd < toleranceEnd) {
        this.setEndPoint()
        console.log('Pasando por el punto final.');

      }

    }, (error) => {
      console.error(error);
    });
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

  setRoute(coordinates: number[][]) {
    if (this.route && this.map) {
      this.map.removeLayer(this.route);
    }

    const geoJsonData: GeoJSON.Feature<GeoJSON.LineString> = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": coordinates
      }
    };
    this.route = L.geoJSON(geoJsonData);
    if (this.map) {
      this.route.addTo(this.map);

      // Icono personalizado para los puntos de la ruta
      const pointIconUrl = 'https://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Marker-Outside-Pink-icon.png'; // URL de la imagen PNG para el icono
      const pointIcon = L.icon({
        iconUrl: pointIconUrl,
        iconSize: [25, 25], // Tamaño del icono
        iconAnchor: [12, 12], // Punto de anclaje del icono
        popupAnchor: [0, -12] // Punto de anclaje del popup
      });

      // Añade un marcador para cada punto de la ruta
      coordinates.forEach((coordinate) => {
        if (this.map) {
          const marker = L.marker([coordinate[1], coordinate[0]], { icon: pointIcon }).addTo(this.map);
          marker.bindPopup(`Punto de ruta: [${coordinate[0]}, ${coordinate[1]}]`).openPopup();
        }
      });

    }
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

    // Set the start point using predefined coordinates
    this.timingService.setStartPoint(this.startCoordinate[1], this.startCoordinate[0]);

    if (this.map) {
      this.startPointMarker = L.marker([this.startCoordinate[1], this.startCoordinate[0]]).addTo(this.map);
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
  this.showSimpleNotification("Pasaste por el punto de inicio", "top", "center");
  endAudio.play();

  // Set the end point using predefined coordinates
  this.timingService.setEndPoint(this.endCoordinate[1], this.endCoordinate[0]);

  if (this.map) {
    this.endPointMarker = L.marker([this.endCoordinate[1], this.endCoordinate[0]]).addTo(this.map);
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

  ngOnDestroy(): void {
    this.noSleep.disable();
    this.locationService.stopWatching();
  }
}

