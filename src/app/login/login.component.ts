import { AfterViewInit, Component, inject, OnInit } from '@angular/core';

import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Capacitor } from '@capacitor/core';              
import { SecureTokenStore } from '../secure-token.store'; 

@Component({
    selector: 'app-login',
    imports: [FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'sinu-angular';
  apiUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private router: Router, 
    private route: ActivatedRoute,
    private secureStore: SecureTokenStore, 
  ) {}

  email: string = '';
  password: string = '';

  ngOnInit(): void {
    
  }

  async onSubmit() {
    const payload = {
      email: this.email,
      password: this.password
    };

    try {
      const response = await fetch(`${this.apiUrl}/login`, {
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
        console.log('Login com sucesso:', data);
      } else {
        const error = await response.json();
        console.error('Erro no login:', error);
      }
    } catch (error) {
      console.error('Erro na requisição de login:', error);
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
      alert(error.message)
    }
  } catch (error) {
    console.error('Erro no login com Google:', error);
    alert('Não foi possível obter a conexão com a API' + error)
  }
}
}
