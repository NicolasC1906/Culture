import { Component, OnInit, OnDestroy, HostListener, ElementRef  } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./section_1.css', './home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  deferredPrompt: any;

  private map: L.Map;
  private userMarker: L.Marker;
  private userRadar: L.Circle;

  constructor(private locationService: LocationService,private el: ElementRef) {}

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    const overlayContent = this.el.nativeElement.querySelector('.overlay-content');
    const scrollY = window.scrollY;

    overlayContent.style.transform = `translateY(${scrollY * 0.5}px)`; // Puedes ajustar el 0.5 para cambiar la velocidad del efecto
  }


  ngOnInit() {
    this.initMap(this.getRandomLocationInBogota());  // Cambio aquí
     // Escuchar el evento beforeinstallprompt
     window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

  }

  ngOnDestroy() {
    this.locationService.stopWatching();
    if (this.userRadar) {
      clearInterval(this.userRadar['interval']); // Stop the radar animation
    }
  }

  private getRandomLocationInBogota(): L.LatLng {
    // Estos son aproximados. Ajusta según lo preciso que quieras ser.
    const latMin = 4.4832, latMax = 4.8127, lonMin = -74.2166, lonMax = -74.0467;

    const lat = Math.random() * (latMax - latMin) + latMin;
    const lon = Math.random() * (lonMax - lonMin) + lonMin;

    return L.latLng(lat, lon);
}


private initMap(initialLocation: L.LatLng): void {
    this.map = L.map('map', {
      zoomControl: false,
      dragging: false,           // Desactiva arrastrar el mapa
      touchZoom: false,          // Desactiva zoom con gestos táctiles
      scrollWheelZoom: false,    // Desactiva zoom con rueda del ratón
      doubleClickZoom: false,    // Desactiva zoom con doble clic
      boxZoom: false,            // Desactiva zoom con cuadro
      keyboard: false            // Desactiva controles con teclado
    }).setView([initialLocation.lat, initialLocation.lng], 13);


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
    this.userMarker = L.marker([initialLocation.lat, initialLocation.lng], { icon: icon }).addTo(this.map);

    // Efecto de radar
    this.userRadar = L.circle([initialLocation.lat, initialLocation.lng], {
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
public showAlert = false;

      // Método ligado al botón "Probar"
      scrollToMap() {
        this.showAlert = true;  // Mostrar el alerta
        const mapElement = document.getElementById('map-wrapper');
        mapElement.scrollIntoView({ behavior: 'smooth' });

        // Luego de mostrar la notificación, intenta obtener la ubicación del usuario
        this.locationService.watchLocation((speed, timestamp, latitude, longitude) => {
          this.updateUserLocation(latitude, longitude);
          this.showAlert = false;  // Ocultar el alerta una vez obtenida la ubicación
        }, (error) => {
          console.error(error);
        });
      }

      showiOSInstallGuide() {
        if (this.isIOS && this.isSafari) {
          // Mostrar la guía de instalación para iOS aquí
        }
      }

      promptInstall() {
  if (this.deferredPrompt) {
    this.deferredPrompt.prompt();

    this.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario aceptó la instalación');
      } else {
        console.log('El usuario rechazó la instalación');
      }
      this.deferredPrompt = null;
    });
  } else if (this.isIOS && this.isSafari) {
    this.showiOSInstallGuide();
  }
}



}
