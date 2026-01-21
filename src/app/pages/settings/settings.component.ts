import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserData, UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {

  isLoading: boolean = true;
  user: UserData | null = null;

  constructor(
    private userService: UserService
  ) { }

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
}
