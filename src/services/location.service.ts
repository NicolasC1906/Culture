import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private watchId: number = -1;
 
  constructor() { }

  watchLocation(successCallback: (speed: number, timestamp: number, latitude: number, longitude: number) => void, errorCallback: (error: string) => void) {
    this.watchId = navigator.geolocation.watchPosition((position) => {
      let speed = position.coords.speed !== null ? position.coords.speed : 0;
      let timestamp = position.timestamp;
      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;

      successCallback(speed, timestamp, latitude, longitude);
    },  (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorCallback("El usuario denegó la solicitud de geolocalización.");
          break;
        case error.POSITION_UNAVAILABLE:
          errorCallback("La información de ubicación no está disponible.");
          break;
        case error.TIMEOUT:
          errorCallback("La solicitud de ubicación del usuario ha expirado.");
          break;
        
      }
    }, {
      enableHighAccuracy: true
    });
  }

  stopWatching() {
    navigator.geolocation.clearWatch(this.watchId);
  }
}
