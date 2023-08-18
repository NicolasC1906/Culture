import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegistroService } from '../../services/registro.service';


interface GarageItem {
  brand: string;
  model: string;
  year: number;
  photo?: string;
}

@Component({
  selector: 'app-data-table-blacklist',
  templateUrl: './data-table-blacklist.component.html',
  styleUrls: ['./data-table-blacklist.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DataTableBlacklistComponent {

  posiciones: Event[];
  public limit = 5;        // Items por página
   public count = 0;         // Total de items
   public offset = 0;        // Página actual
   public isLoading = true; // Añade esta propiedad



    constructor(private registroService: RegistroService) { }

    ngOnInit(): void {
      this.isLoading = true;
      this.registroService.getBlackList().subscribe(data => {
        this.posiciones = data;
        this.count = data.length;
        this.isLoading = false; // Añade esta línea
      });
    }


   onPage(event) {
    this.offset = event.offset;
    // Si necesitas realizar alguna acción adicional cuando cambie de página, hazlo aquí
 }






}
