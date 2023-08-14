import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RegistroService } from '../../../services/registro.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  expiresIn: string;
  idUser: number; 
  Profile?: any;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder,  private registroService: RegistroService, private toastr: ToastrService, private router: Router) {
    this.loginForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      clave: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      
    });
  }

  numericOnly(event: any): boolean {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
  
    if (!pattern.test(inputChar)) {
      // caracter no válido, previene la entrada
      event.preventDefault();
      return false;
    }
    return true;
  }

  
  ngOnInit(): void {
  }

  // onSubmit() {
  //    if (this.loginForm.valid) {
  //      const phoneNumber = this.loginForm.get('telefono').value;
  //      const password = this.loginForm.get('clave').value;
  
  //      this.registroService.loginUser(phoneNumber, password).subscribe((response: LoginResponse) => {
  //        console.log('Respuesta del servidor:', response);
  //        localStorage.setItem('token', response.token);
  //        localStorage.setItem('expiresIn', response.expiresIn);
  //        if (response.Profile === null) {
  //          // Redirecciona al perfil del usuario si "Profile" es null
  //          this.router.navigate(['/user-profile', { id: response.id }]);
  //        } else {
  //          // Redirecciona al home si "Profile" no es null
  //          this.router.navigate(['/home']);
  //        }
  //      }, error => {
  //        console.error('Error al iniciar sesión:', error);
  
  //        // Mostrar notificación de error al usuario
  //       this.toastr.error('Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo.', 'Error', {
  //         timeOut: 8000,
  //         closeButton: true,
  //         enableHtml: true,
  //         toastClass: "alert alert-danger alert-with-icon",
  //         positionClass: 'toast-top-right' //Puedes cambiar la posición si lo prefieres
  //       });
  //      });
  //    }
  //  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      const phoneNumber = this.loginForm.get('telefono').value;
      const password = this.loginForm.get('clave').value;
  
      this.registroService.loginUser(phoneNumber, password).subscribe((loginResponse: LoginResponse) => {
        console.log('Respuesta del servidor:', loginResponse);
        localStorage.setItem('token', loginResponse.token);
        localStorage.setItem('expiresIn', loginResponse.expiresIn);
  
        // Aquí guardamos el idUser en el localStorage
        localStorage.setItem('idUser', loginResponse.idUser.toString());
  
        // Aquí hacemos la segunda llamada a la API
        this.registroService.getUsuarioProfile(loginResponse.idUser).subscribe(profileResponse => {
          if (profileResponse.Profile === null) {
            // Redirecciona al perfil del usuario si "Profile" es null
            this.router.navigate(['/user-profile', { id: loginResponse.idUser }]);
          } else {
            // Redirecciona al home si "Profile" no es null
            this.router.navigate(['/home']);
          }
        }, error => {
          console.error('Error al obtener el perfil del usuario:', error);
          this.toastr.error('No se pudo obtener la información del perfil. Inténtalo de nuevo.', 'Error');
        });
  
      }, error => {
        console.error('Error al iniciar sesión:', error);
        this.toastr.error('Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo.', 'Error', {
          timeOut: 8000,
          closeButton: true,
          enableHtml: true,
          toastClass: "alert alert-danger alert-with-icon",
          positionClass: 'toast-top-right'
        });
      });
    }
  }
  
  


}

