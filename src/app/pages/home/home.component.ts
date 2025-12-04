import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user.service';
import { UserData } from '../../user.service';
import { SubscriptionsComponent } from 'src/app/components/subscriptions/subscriptions.component';

@Component({
    selector: 'app-home',
    imports: [CommonModule, SubscriptionsComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  user: UserData | null = null;

  constructor(
    private userService: UserService
  ) { }

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
