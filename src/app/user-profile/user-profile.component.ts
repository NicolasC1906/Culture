import { Component, OnInit } from '@angular/core';
import { RegistroService } from '../../services/registro.service';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxQRCodeModule } from 'ngx-qrcode2';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  

  profileForm: FormGroup;
  userId: any;
  qrCodeValue: string = '';

  userProfile: {
    username: string;
    name: string;
    email: string;
    city: string;
    phoneNumber: string;
    role: string;
  } = {
    username: '',
    name: '',
    email: '',
    city: '',
    phoneNumber: '',
    role: ''
  };
  

  constructor(private registroService: RegistroService, private route: ActivatedRoute) { }

  ngOnInit() {
    // Obtener el ID del usuario desde la URL
    this.userId = +localStorage.getItem('idUser'); 
    //console.log(this.userId);
    this.initForm();
    this.loadUserProfile()
  }


  initForm() {
    this.profileForm = new FormGroup({
      userId: new FormControl(this.userId),  // <- aquí estaba el problema
      username: new FormControl(''),
      name: new FormControl(''),
      email: new FormControl(''),
      city: new FormControl('')   
    });
}


  actualizarInformacion() {
    const formData = this.profileForm.value;
    console.log('Datos enviados a la API:', formData);

    this.registroService.completarPerfil(formData).subscribe(response => {
      // Manejar respuesta, por ejemplo mostrar un mensaje de éxito.
    }, error => {
      // Manejar error, por ejemplo mostrar un mensaje de error.
    });
  }

  loadUserProfile() {
    this.registroService.getUsuarioProfile(this.userId).subscribe(response => {
      if (response.Profile === null) {
        // Redirecciona al perfil del usuario si "Profile" es null
        console.log("Hola soy null")
      } else {
        this.userProfile = {
          username: response.Profile.username,
          name: response.Profile.name,
          email: response.Profile.email,
          city: response.Profile.city,
          phoneNumber: response.phoneNumber,
          role: response.role
        }
              // Convertir el objeto userProfile a una cadena de texto para el QR
         this.qrCodeValue = JSON.stringify(this.userProfile);
         this.generateAvatar(this.userProfile.name);
      }
    });
  }
  

  generateAvatar(name: string) {
    const size = 100; // Tamaño final deseado
    const scaleFactor = 3; // Factor de escala para mejorar la calidad

    const canvas = document.createElement('canvas');
    canvas.width = size * scaleFactor; 
    canvas.height = size * scaleFactor;

    const context = canvas.getContext('2d');
    if (context) {
      context.scale(scaleFactor, scaleFactor);

      // Pinta el fondo negro
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Establece las propiedades de la fuente
      context.font = `${20 * scaleFactor}px Anton`; 
      context.fillStyle = 'white';
      context.textBaseline = 'middle';

      // Dibuja la inicial del nombre en el canvas
      const initial = name.charAt(0).toUpperCase();
      const textMetrics = context.measureText(initial);
      const x = (size - textMetrics.width) / 2;  // Ajuste aquí
      const y = size / 3 + (20 * scaleFactor) / 2;  // Ajuste aquí
      context.fillText(initial, x, y);

      // Establece la imagen del canvas como fuente del avatar
      const dynamicAvatar = document.getElementById('dynamicAvatar') as HTMLImageElement;
      dynamicAvatar.src = canvas.toDataURL('image/png');
    }
}



  

     

}