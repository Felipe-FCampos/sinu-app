import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { UserData, UserService } from 'src/app/user.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  user: UserData | null = null;
  isLoading: boolean = true;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
        this.userService.getUserData().subscribe({
      next: (data: UserData) => {
        this.user = data;
        console.log('User Data: ', data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user data: ', error);
        this.isLoading = false;
      }
    });
  }  

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
