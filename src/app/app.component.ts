import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router'; // Cambiar Route por Router
import { filter } from 'rxjs/operators';

declare var gtag;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  constructor(
    private router: Router // Cambiar Route por Router
  ) {
    const navEndEvents$ = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      );

    navEndEvents$.subscribe((event: NavigationEnd) => { // Agregar paréntesis alrededor de "event: NavigationEnd"
      gtag('config', 'G-W0YK205432', {
        'page_path': event.urlAfterRedirects
      });
    });
  }
}
