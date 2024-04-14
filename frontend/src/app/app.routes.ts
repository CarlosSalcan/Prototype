import { Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'user', component: UserComponent },
    //{ path: '', redirectTo: '/login', pathMatch: 'full' },    
];
