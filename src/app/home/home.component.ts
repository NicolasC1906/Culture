import { Component, OnInit, OnDestroy, HostListener, ElementRef, Renderer2  } from '@angular/core';
import * as L from 'leaflet';
import { LocationService } from '../../services/location.service';
import { ToastrService } from 'ngx-toastr';
declare var gtag: any;  // <-- Aquí está la declaración



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

  constructor(
    private locationService: LocationService,
    private el: ElementRef,
    private renderer: Renderer2,
    private toastr: ToastrService
    ) {}


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
    // Escucha el evento de clic del botón y envía el evento a Google Analytics
    const buttonElement = this.el.nativeElement.querySelector('.my-special-button');
        if (buttonElement) {
            this.renderer.listen(buttonElement, 'click', (event) => {
              console.log('Intentando enviar evento button_click a Google Analytics...');  // <-- Antes de enviar
              gtag('event', 'button_click', {
                'event_category': 'user_interaction',
                'event_label': 'my_special_button',
                'value': '1'
              });
              console.log('Evento button_click enviado a Google Analytics.');  // <-- Después de enviar
            });
        }


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

showSimpleNotification(message: string, from: string, align: string) {
  this.toastr.info(message, '', {
      timeOut: 8000,
      closeButton: true,
      enableHtml: true,
      toastClass: "alert alert-info",
      positionClass: 'toast-' + from + '-' + align
  });
}

      // Método ligado al botón "Probar"
      scrollToMap() {
        // Mostrar el alerta
        const endAudio = new Audio('assets/sound/end.mp3');
        this.showSimpleNotification("Por defecto, la aplicación muestra lugares aleatorios. Al probar nuestro servicio gratuito, detectaremos tu ubicación en tiempo real.", "top", "center");
        this.showSimpleNotification("¡Hola soy Culture! Estoy accediendo a su ubicación.", "bottom", "center");
        endAudio.play();
        // Intentar hacer vibrar el dispositivo
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);  // Vibra 200ms, pausa 100ms, vibra 200ms

          }

        const mapElement = document.getElementById('map-wrapper');
        mapElement.scrollIntoView({ behavior: 'smooth' });

        // Luego de mostrar la notificación, intenta obtener la ubicación del usuario
        this.locationService.watchLocation((speed, timestamp, latitude, longitude) => {
          this.updateUserLocation(latitude, longitude);
        }, (error) => {
          console.error(error);
        });

        // Escucha el evento de clic del botón y envía el evento a Google Analytics
            const buttonElement = this.el.nativeElement.querySelector('.my-special-button');
            if (buttonElement) {
              this.renderer.listen(buttonElement, 'click', (event) => {
                console.log('Intentando enviar evento button_click a Google Analytics...');  // <-- Antes de enviar
              gtag('event', 'button_click', {
                'event_category': 'user_interaction',
                'event_label': 'my_special_button',
                'value': '1'
              });
              console.log('Evento button_click enviado a Google Analytics.');
              });
  }
    }


    showiOSInstallGuide() {
      const guideElement = document.getElementById('ios-install-guide');
      if (guideElement) {
        guideElement.style.display = 'block';
      }
    }



    closeGuide() {
      const guideElement = document.getElementById('ios-install-guide');
      if (guideElement) {
        guideElement.style.display = 'none';
      }
    }

    onInstallClick() {
      this.promptInstall();
      if (this.isIOS && this.isSafari) {
        this.showiOSInstallGuide();
      }
    }

      promptInstall() {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();

          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('El usuario aceptó la instalación');

              // Enviar evento a Google Analytics indicando que el usuario aceptó la instalación
              gtag('event', 'install_prompt', {
                'event_category': 'user_interaction',
                'event_label': 'accepted',
                'value': '1'
              });
              console.log('Evento install_prompt accepted enviado a Google Analytics.');  // <-- Después de enviar

            } else {
              console.log('El usuario rechazó la instalación');

              // Enviar evento a Google Analytics indicando que el usuario rechazó la instalación
              console.log('Intentando enviar evento install_prompt rejected a Google Analytics...');  // <-- Antes de enviar
              gtag('event', 'install_prompt', {
                'event_category': 'user_interaction',
                'event_label': 'rejected',
                'value': '0'
              });
              console.log('Evento install_prompt rejected enviado a Google Analytics.');  // <-- Después de enviar

            }
            this.deferredPrompt = null;
          });
        } else if (this.isIOS && this.isSafari) {
          this.showiOSInstallGuide();
        }
      }




}
