import { Component, OnInit } from '@angular/core';
import { UserData, UserService } from 'src/app/services/user.service';
import { InvestmentsComponent } from 'src/app/components/investments/investments.component';

@Component({
  selector: 'app-investments-page',
  imports: [InvestmentsComponent],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.scss',
})
export class InvestmentsPageComponent implements OnInit {

  appName!: string;
  user: UserData | null = null;

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
      },
      error: (error) => {
        console.error('Error fetching user data: ', error);
      }
    });
  }
}