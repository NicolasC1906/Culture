import { Component, OnInit } from '@angular/core';
import { RegistroService } from '../../services/registro.service';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';



export interface City {
  name: string;
  department: string;
}


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  // Sliderç
  public isCollapsed = true;
  public isCollapsed1: boolean = true;
  public isCollapsed2: boolean = true;

  // Slider
  imageToShow: string;


  isLoading: boolean = false;
  isUpdating: boolean = false;


  profileForm: FormGroup;
  garajeForm: FormGroup;

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



  cities: Array<City> = [
    { name: 'Bogotá', department: 'Bogotá' },
    { name: 'Medellín', department: 'Antioquia' },
    { name: 'Cali', department: 'Valle del Cauca' },
    { name: 'Barranquilla', department: 'Atlántico' },
    { name: 'Cartagena', department: 'Bolívar' },
    { name: 'Manizales', department: 'Caldas' },
    { name: 'Pereira', department: 'Risaralda' },
    { name: 'Bucaramanga', department: 'Santander' },
    { name: 'Ibagué', department: 'Tolima' },
    { name: 'Valledupar', department: 'Cesar' },
    { name: 'Santa Marta', department: 'Magdalena' },
    { name: 'Villavicencio', department: 'Meta' },
    { name: 'Popayán', department: 'Cauca' },
    { name: 'Montería', department: 'Córdoba' },
    { name: 'Neiva', department: 'Huila' },
    { name: 'Armenia', department: 'Quindío' },
    { name: 'Sincelejo', department: 'Sucre' },
    { name: 'Pasto', department: 'Nariño' },
    { name: 'Tunja', department: 'Boyacá' },
    { name: 'Cúcuta', department: 'Norte de Santander' },
    { name: 'Riohacha', department: 'La Guajira' },
    { name: 'Yopal', department: 'Casanare' },
    { name: 'Leticia', department: 'Amazonas' },
    { name: 'San José del Guaviare', department: 'Guaviare' },
    { name: 'Florencia', department: 'Caquetá' },
    { name: 'Mocoa', department: 'Putumayo' },
    { name: 'San Andrés', department: 'San Andrés y Providencia' },
    { name: 'Quibdó', department: 'Chocó' },
    { name: 'Arauca', department: 'Arauca' },
    { name: 'Mitú', department: 'Vaupés' },
    { name: 'Inírida', department: 'Guainía' },
    { name: 'Puerto Carreño', department: 'Vichada' }
  ];

  filterValue: string = '';  // Valor para el filtro de ciudades
  filteredCities: Array<City> = this.cities.slice();  // Array de ciudades filtradas (inicialmente todas)


  constructor(
    private registroService: RegistroService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal
) { }


  ngOnInit() {
    // Obtener el ID del usuario desde la URL
    this.userId = +localStorage.getItem('idUser');
    //console.log(this.userId);
    this.initForm();
    this.loadUserProfile()
    this.garajeInitForm()


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

    garajeInitForm() {
      this.garajeForm = new FormGroup({
        brand: new FormControl(''),
        model: new FormControl(''),
        year: new FormControl(''),
        photo: new FormControl(''),
      });
    }

    handleFileInput(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const base64Image = e.target.result;
        this.imageToShow = base64Image;
        this.garajeForm.get('photo').setValue(base64Image.split(',')[1]);
      };

      reader.readAsDataURL(file);
    }



    enviarDatosGaraje() {
      const formData = this.garajeForm.value;
      console.log('Datos enviados a la API:', formData);
      this.isLoading = true;
      this.registroService.crearGaraje(formData, this.userId).subscribe(response => {
        // Aquí manejas la respuesta, por ejemplo, mostrar un mensaje de éxito
        this.isLoading = false;
        this.toastr.success('Información del garaje actualizada con éxito.');
      }, error => {
        this.toastr.error('Hubo un error al actualizar la información del garaje.');
      });
    }


    actualizarInformacion() {
      const formData = this.profileForm.value;
      console.log('Datos enviados a la API:', formData);
      this.isUpdating = true;

      this.registroService.completarPerfil(formData).subscribe(response => {
        // Desactivar el loading
        this.isUpdating = false;
        // Manejar respuesta, por ejemplo mostrar un mensaje de éxito.
        this.toastr.success('La información se ha actualizado correctamente.', 'Atención', {
          timeOut: 8000,
          closeButton: true,
          enableHtml: true,
          toastClass: "alert alert-info alert-with-icon",
          positionClass: 'toast-top-right',
        }).onHidden.subscribe(() => {
          location.reload();
        });
      }, error => {
        // Manejar error, por ejemplo mostrar un mensaje de error.
        this.toastr.error('Hubo un error al actualizar la información.');
      });
    }

    loadUserProfile() {
      // Activar el loading
      this.isLoading = false;

      this.registroService.getUsuarioProfile(this.userId).subscribe(
          response => {
              // Desactivar el loading
              this.isLoading = false;

              if (response.Profile === null) {
                  console.log("Hola soy null");
              } else {
                  this.userProfile = {
                      username: response.Profile.username,
                      name: response.Profile.name,
                      email: response.Profile.email,
                      city: response.Profile.city,
                      phoneNumber: response.phoneNumber,
                      role: response.role
                  };

                  this.profileForm.patchValue({
                      username: this.userProfile.username,
                      name: this.userProfile.name,
                      email: this.userProfile.email,
                      city: this.userProfile.city
                  });

                  this.qrCodeValue = JSON.stringify(this.userProfile);
                  this.generateAvatar(this.userProfile.name);
              }

          },
          error => {
              // Desactivar el loading en caso de error
              this.isLoading = false;

              this.toastr.error('Hubo un error al cargar la información del perfil.');
          }
      );
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

    filterCities() {
      const lowerCaseFilter = this.filterValue.toLowerCase();
      this.filteredCities = this.cities.filter(city => city.name.toLowerCase().includes(lowerCaseFilter));
    }



}
