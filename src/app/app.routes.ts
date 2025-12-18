import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './register/register.component';
import { SubsComponent } from './pages/subs/subs.component';

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
            { path: 'subscriptions', component: SubsComponent }
        ],
    }
];
