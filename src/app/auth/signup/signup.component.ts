import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  isLoading= false;

  private authStatusSub: Subscription;


  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )
  }

  onSignup(form: NgForm) {
    if(form.invalid) {
      return
    }
    // this.authService.createUser(form.value.email, form.value.password)
    //? kayıtlı bşir email adresinin şifresini yanlış girdiğimiz zaman oluşacak hatayı handle etmek için
    this.authService.createUser(form.value.email, form.value.password)
  }

  ngOnDestroy(): void {
      this.authStatusSub.unsubscribe();
  }

}
