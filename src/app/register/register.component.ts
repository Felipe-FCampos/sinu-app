import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Capacitor } from '@capacitor/core';              
import { SecureTokenStore } from '../secure-token.store'; 

@Component({
    selector: 'app-register',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  title = 'sinu-angular';
  apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private router: Router, 
    private route: ActivatedRoute,
    private secureStore: SecureTokenStore, 
  ) {}

  name: string = '';
  email: string = '';
  password: string = '';

  ngOnInit(): void {
    
  }

  async onSubmit() {
    const payload = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    try {
      const response = await fetch(`${this.apiUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(Capacitor.isNativePlatform() ? { 'X-Client': 'app' } : {}),
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.authService.setToken(data.idToken);

        if (Capacitor.isNativePlatform() && data.refreshToken) {
          await this.secureStore.setRefresh(data.refreshToken);
        }

        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
        this.router.navigateByUrl(redirect); 
        console.log('Cadastro feito com sucesso:', data);
      } else {
        const error = await response.json();
        console.error('Erro no cadastro:', error);
      }
    } catch (error) {
      console.error('Erro na requisição de cadastro:', error);
    }
  }

  async googleLogin() {
    try {
    const { googleIdToken } = await this.authService.signInWithGoogle();
    const response = await fetch(`${this.apiUrl}/auth/google`, {                             
       method: 'POST',
       headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${googleIdToken}`,
         ...(Capacitor.isNativePlatform() ? { 'X-Client': 'app' } : {}),
       },
       body: JSON.stringify({ googleIdToken }),
       credentials: 'include'
     })

    if (response.ok) {
      const data = await response.json();
      this.authService.setToken(data.idToken);
      if (Capacitor.isNativePlatform() && data.refreshToken) {  
          await this.secureStore.setRefresh(data.refreshToken);
      }
      const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/';
      this.router.navigateByUrl(redirect); 
    } else {
      const error = await response.json();
      console.error('Erro no login:', error);
    }
  } catch (error) {
    console.error('Erro no login com Google:', error);
  }
}
}
