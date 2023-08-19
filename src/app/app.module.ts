import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { GpsTestComponent } from './gps-test/gps-test.component';
import { MapTestComponent } from './map-test/map-test.component';


import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { AddCarsComponent } from './Modals/add-cars/add-cars.component';
import { InfoEventComponent } from './eventos/info-event/info-event.component';
import { EventsComponent } from './eventos/events/events.component';
import { DatePipe } from '@angular/common';
import { TracksComponent } from './pistas/tracks/tracks.component';
import { TrackDetailComponent } from './pistas/track-detail/track-detail.component';
import { TrackResumeComponent } from './pistas/track-resume/track-resume.component';

import { BrowserModule } from '@angular/platform-browser';
import { DataTableBlacklistComponent } from './data-table-blacklist/data-table-blacklist.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MapTrackComponent } from './map-track/map-track.component';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    NgbModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    NgxQRCodeModule,
    NgxDatatableModule,
    ToastrModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    GpsTestComponent,
    MapTestComponent,
    HomeComponent,
    AddCarsComponent,
    InfoEventComponent,
    EventsComponent,
    TracksComponent,
    TrackDetailComponent,
    TrackResumeComponent,
    DataTableBlacklistComponent,
    MapTrackComponent, // Añádelo aquí

  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
