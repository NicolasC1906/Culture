import { Component, OnInit } from '@angular/core';
import { RegistroService, Vehicle } from '../../services/registro.service';
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

   // Lista de vehículos:
   public vehicles: any[] = [];
   selectedVehicleId: number;
   vehicleIdToEdit: number | null = null;



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
    this.loadUserVehicles();


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

      // Comprueba si el archivo supera los 5 MB
      if (file.size > 5 * 1024 * 1024) {  // 5 MB = 5 * 1024 * 1024 bytes
          this.toastr.error('El archivo es demasiado grande. Por favor, sube una imagen de menos de 5 MB.', 'Atención', {
            timeOut: 80000,
            closeButton: true,
            enableHtml: true,
            toastClass: "alert alert-danger",
            positionClass: 'toast-top-center',
          })
        return;
      }

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
      this.isUpdating = true;
      this.registroService.crearGaraje(formData, this.userId).subscribe(response => {
        // Aquí manejas la respuesta, por ejemplo, mostrar un mensaje de éxito

         // Manejar respuesta, por ejemplo mostrar un mensaje de éxito.
         this.toastr.success('La información se ha actualizado correctamente.', 'Atención', {
          // timeOut: 8000,
          closeButton: true,
          enableHtml: true,
          toastClass: "alert alert-info alert-with-icon",
          positionClass: 'toast-top-right',
        }).onHidden.subscribe(() => {
          this.isUpdating = false;
          location.reload();
        });
      }, error => {
        this.toastr.error('Hubo un error al actualizar la información del garaje.');
      });
    }

    loadUserVehicles() {
      this.isUpdating = true; // Mostramos el spinner antes de empezar la solicitud

      this.registroService.getUsuarioGaraje(this.userId).subscribe(
          response => {
              this.vehicles = response.map(vehicle => {
                // Agregar el prefijo para imágenes Base64 a la propiedad 'photo'
                vehicle.photo = 'data:image/jpeg;base64,' + vehicle.photo;
                return vehicle;
              });
              //console.log(this.vehicles);
          },
          error => {
              this.toastr.error('Hubo un error al cargar los vehículos del usuario.');
          },
          () => {
              this.isUpdating = false; // Ocultamos el spinner al finalizar la solicitud (ya sea con éxito o con error)
          }
      );
    }







    actualizarInformacion() {
      const formData = this.profileForm.value;
      console.log('Datos enviados a la API:', formData);
      this.isUpdating = true;

      this.registroService.completarPerfil(formData).subscribe(response => {
        // Manejar respuesta, por ejemplo mostrar un mensaje de éxito.
        this.toastr.success('La información se ha actualizado correctamente.', 'Atención', {
          timeOut: 8000,
          closeButton: true,
          enableHtml: true,
          toastClass: "alert alert-info alert-with-icon",
          positionClass: 'toast-top-right',
        }).onHidden.subscribe(() => {
          this.isUpdating = false;
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
        context.fillStyle = '#2c2c2c';
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



    onEditVehicleClick(vehicle: Vehicle) {
      this.vehicleIdToEdit = vehicle.id;
      this.garajeForm.patchValue({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          photo: vehicle.photo
      });
      this.isCollapsed2 = false;  // Abre el colapsable
  }


    updateVehicle() {
      const formData = this.garajeForm.value;
      console.log('Datos enviados a la API:', formData);
      this.isUpdating = true;

      this.registroService.editCarGaraje(formData, this.vehicleIdToEdit).subscribe(response => {
          this.toastr.success('El vehículo se ha actualizado correctamente.', 'Atención', {
              closeButton: true,
              enableHtml: true,
              toastClass: "alert alert-info alert-with-icon",
              positionClass: 'toast-top-right',
          }).onHidden.subscribe(() => {
              this.isUpdating = false;
              this.loadUserVehicles();
          });
      }, error => {
          this.toastr.error('Hubo un error al actualizar la información del vehículo.');
      });
  }


  onDeleteVehicleClick(vehicle: Vehicle) {
    const isConfirmed = confirm('¿Estás seguro de que deseas eliminar este vehículo?');

    if (isConfirmed) {

        this.registroService.DeleteCarGaraje({}, vehicle.id).subscribe(response => {
            this.toastr.success('El vehículo se ha eliminado correctamente.', 'Atención', {
                closeButton: true,
                enableHtml: true,
                toastClass: "alert alert-info alert-with-icon",
                positionClass: 'toast-top-right',
            }).onHidden.subscribe(() => {

                this.loadUserVehicles();
            });
        }, error => {
            this.toastr.error('Hubo un error al eliminar el vehículo.');

        });
    }
}







}
