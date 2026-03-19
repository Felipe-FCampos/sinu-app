import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  itemsPanelOpen = false;
  isClosing = false;

  openPanel() {
    this.itemsPanelOpen = true;
    this.isClosing = false;
  }

  toggleItemsPanel() {
    if (!this.itemsPanelOpen) {
      this.openPanel();
    } else {
      this.startClosing();
    }
  }

  startClosing() {
    this.isClosing = true;
    setTimeout(() => {
      this.itemsPanelOpen = false;
      this.isClosing = false;
    }, 160); // mesmo tempo da animação
  }
}
