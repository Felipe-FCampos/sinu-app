import { Component, OnInit } from '@angular/core';
import { UserData, UserService } from 'src/app/services/user.service';
import { SubscriptionsComponent } from 'src/app/components/subscriptions/subscriptions.component';

@Component({
  selector: 'app-subs',
  imports: [SubscriptionsComponent],
  templateUrl: './subs.component.html',
  styleUrls: ['./subs.component.scss'],
})
export class SubsComponent implements OnInit {

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
