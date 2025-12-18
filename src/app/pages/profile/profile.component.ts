import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {

  constructor(private auth: AuthService, private router: Router) {}

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
