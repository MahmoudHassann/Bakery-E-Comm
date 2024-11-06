import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/Auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/Payments/payment.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebookF, faGoogle, faLinkedinIn, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  loginForm: FormGroup;
  errorMessage: string | null = null;
  items: any
  isPasswordVisible = false;
  isUser = true;
  
  faFacebookF = faFacebookF
  faTwitter = faTwitter
  faLinkedinIn = faLinkedinIn
  faGoogle = faGoogle
  faEye =faEye
  faEyeSlash =faEyeSlash

  constructor(private authService: AuthService, private router: Router, private paymentService: PaymentService,private route: ActivatedRoute ) {
    this.loginForm = new FormGroup({
      name: new FormControl(""),
      email: new FormControl("", [Validators.email, Validators.required]),
      password: new FormControl("", [Validators.required])
    })
  
  }

 
  
  login() {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res: any) => {
        // Store access and refresh tokens
        this.authService.storeAccessToken(res.accessToken);

        // Sync cart count after successful login
        this.paymentService.syncCartCountAfterLogin();

        // Navigate to the home page
        this.route.queryParams.subscribe(params => {
          const redirectUrl = params['redirectTo'] || '/home'; // Default to home if no redirect URL
          this.router.navigate([redirectUrl]); // Navigate to the redirect URL after successful login
        });
      },
      error: (err) => {
        this.errorMessage = err.error.message;
        console.error('Login Error', err);
      }
    });
  }

  register(){
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.register(this.loginForm.value).subscribe({
      next:(res)=>{
        this.isUser = true;
      }
    })
    
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  alreadyUser(): void{
    this.isUser = !this.isUser;
  }
  onSubmit(){
    if(this.isUser)
    {
      this.login()
    }
    else{
      this.register()
      
    }
  }


}
