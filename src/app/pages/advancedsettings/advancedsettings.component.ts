import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PushService } from 'src/app/services/push.service';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-advancedsettings',
  imports: [RouterLink],
  templateUrl: './advancedsettings.component.html',
  styleUrls: ['./advancedsettings.component.scss'],
})
export class AdvancedsettingsComponent {

  isNotificationsEnabled: boolean = false;
  showPermissionModal: boolean = false;

  constructor(
    private push: PushService
  ) { }

  async ngOnInit() {
    const permStatus = await PushNotifications.checkPermissions();
    this.isNotificationsEnabled = permStatus.receive === 'granted';
  }

  async onToggleNotifications(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive !== 'granted') {
        permStatus = await PushNotifications.requestPermissions();
      }
      this.isNotificationsEnabled = permStatus.receive === 'granted';
      if (this.isNotificationsEnabled) {
        this.push.init();
      } else {
        input.checked = false;
      }
    } else {
      this.isNotificationsEnabled = false;
      // Exibe o modal informativo ao tentar desativar
      this.showPermissionModal = true;
      input.checked = false;
    }
  }

  closePermissionModal() {
    this.showPermissionModal = false;
    const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (input) {
      input.checked = true;
    }
  }
}
