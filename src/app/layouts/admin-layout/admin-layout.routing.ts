import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { GpsTestComponent } from '../../gps-test/gps-test.component';
import { MapTestComponent } from '../../map-test/map-test.component';
import { AuthGuard } from '../../guards/auth.guard';
import { HomeComponent } from '../../home/home.component';
import { EventsComponent } from '../../eventos/events/events.component';
import { InfoEventComponent } from '../../eventos/info-event/info-event.component';
import { TracksComponent } from '../../pistas/tracks/tracks.component';
import { TrackDetailComponent } from '../../pistas/track-detail/track-detail.component';
import { MapTrackComponent } from '../..//map-track/map-track.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'home',      component: HomeComponent },
    { path: 'dashboard',      component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'user-profile',   component: UserProfileComponent, canActivate: [AuthGuard]  },
    { path: 'table-list',     component: TableListComponent, canActivate: [AuthGuard]  },
    { path: 'typography',     component: TypographyComponent, canActivate: [AuthGuard]  },
    { path: 'icons',          component: IconsComponent, canActivate: [AuthGuard]  },
    { path: 'maps',           component: MapsComponent, canActivate: [AuthGuard]  },
    { path: 'notifications',  component: NotificationsComponent, canActivate: [AuthGuard]  },
    { path: 'upgrade',        component: UpgradeComponent, canActivate: [AuthGuard]  },
    { path: 'gps-test',        component: GpsTestComponent , canActivate: [AuthGuard]  },
    { path: 'map-test',        component: MapTestComponent, canActivate: [AuthGuard] },
    { path: 'event',        component: EventsComponent, canActivate: [AuthGuard] },
    { path: 'event-detail/:id', component: InfoEventComponent, canActivate: [AuthGuard] },
    { path: 'tracks',        component: TracksComponent, canActivate: [AuthGuard] },
    { path: 'track-detail/:id', component: TrackDetailComponent, canActivate: [AuthGuard] },
    { path: 'map-track',        component: MapTrackComponent, canActivate: [AuthGuard] },
];
