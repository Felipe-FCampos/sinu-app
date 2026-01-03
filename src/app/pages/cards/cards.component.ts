import { Component, OnInit } from '@angular/core';
import { CardComponent } from 'src/app/components/card/card.component';
import { UserData, UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-cards',
  imports: [CardComponent],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnInit {

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
