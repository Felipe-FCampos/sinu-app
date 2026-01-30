import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './register/register.component';
import { SubsComponent } from './pages/subs/subs.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CardsComponent } from './pages/cards/cards.component';
import { InfoCardComponent } from './pages/info-card/info-card.component';
import { SapsComponent } from './pages/saps/saps.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdvancedsettingsComponent } from './pages/advancedsettings/advancedsettings.component';
import { SupportComponent } from './pages/support/support.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: '',
        canActivateChild: [authGuard],
        children: [
            { path: '', component: HomeComponent },
            { path: 'subscriptions', component: SubsComponent },
            { path: 'standalonepayments', component: SapsComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'cards', component: CardsComponent },
            { path: 'card/:id', component: InfoCardComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'advancedsettings', component: AdvancedsettingsComponent },
            { path: 'support', component: SupportComponent },
        ],
    }
];
