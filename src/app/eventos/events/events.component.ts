import { Component } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  events: Event[] = [];

  constructor(config: NgbCarouselConfig, private http: HttpClient) {
    config.interval = 5000;
    config.keyboard = true;
    config.pauseOnHover = true;
  }

  ngOnInit() {
    this.http.get<Event[]>('https://culture.apiimd.com/events').subscribe(data => {
      this.events = data;
      console.log(this.events)
    });
  }
}