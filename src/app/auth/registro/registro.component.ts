import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RegistroService } from '../../../services/registro.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {

  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private registroService: RegistroService) {
    
    this.registroForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      clave: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      aceptarTerminos: ['', [Validators.required, Validators.pattern(/si/)]]
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

  onSubmit() {
    if (this.registroForm.valid) {
        const phoneNumber = this.registroForm.get('telefono').value;
        const password = this.registroForm.get('clave').value;

        this.registroService.registerUser(phoneNumber, password).subscribe(
            response => {
                console.log('Registro exitoso', response);

                // Muestra un alerta indicando que el registro fue exitoso
                window.alert('Registro exitoso');

                // Redirige al usuario a la página de login
                window.location.href = 'https://cultureco.app/auth/login';
            },
            error => {
                console.error('Error en el registro:', error);
                
                // Muestra un alerta con el mensaje de error
                window.alert('Error en el registro: ' + error.error.error);
            }
        );
    }
}
}
