import { Component } from '@angular/core';
import { UserData, UserService } from 'src/app/services/user.service';
import { SapComponent } from 'src/app/components/sap/sap.component';

@Component({
  selector: 'app-saps',
  standalone: true,
  imports: [SapComponent],
  templateUrl: './saps.component.html',
  styleUrls: ['./saps.component.scss'],
})
export class SapsComponent {

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
