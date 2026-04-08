import { Component } from '@angular/core';
import { UserData, UserService } from 'src/app/services/user.service';
import { InfoincomeComponent } from "src/app/components/infoincome/infoincome.component";

@Component({
  selector: 'app-income',
  imports: [InfoincomeComponent],
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss',
})
export class IncomeComponent {

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
