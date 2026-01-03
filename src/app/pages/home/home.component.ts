import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user.service';
import { UserData } from '../../services/user.service';

import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';

@Component({
    selector: 'app-home',
    imports: [DashboardComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  appName!: string;
  user: UserData | null = null;
  isLoading: boolean = true;

  constructor(
    private userService: UserService
  ) {
    this.appName = this.userService.appName;
   }

  ngOnInit() {
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
