import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthData } from './auth-data.model';

const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //? post-list'teki hatayı gidermek için
  private isAuthenticated = false;

  //? 60 dk sonra token yok olacak
  private tokenTimer: any;

  //? for authorization
  private userId : string;

  //! token --> i want to store it somehow so that i can use attach it to future requests. we can add interceptors which are simply functions that will run on any outgoing HTTP requests and manipulate these outgoing requests, for example to attach our token
  private token: string;
  private authStatusListener = new Subject<boolean>() //* i will use that subject to push authentication information to the components which are interested. boolean --> i don't really need the token in my other components

  constructor(private http: HttpClient, private router: Router) { }

  //! diğer servicelere export yapmak için oluşturduk. Bunun için interceptor oluşturuyoruz.
  getToken() {
    return this.token;
  }

  //? post-list'teki hatayı gidermek için
  getIsAuth() {
    return this.isAuthenticated;
  }

  //?for authorization
  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable(); //? so that we cant emit new values from other components
  }


  createUser(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post(BACKEND_URL + "/signup", authData) //? post --> backend tarafında router.post metodu kullandığımız için post metodu kullandık. "http://localhost:3000/api/user/signup" --> app.js'de tanımladığımız route üzerinden yaptık.
      .subscribe(() => {
        this.router.navigate(['/'])
      }, error => {
        this.authStatusListener.next(false)
      });
  }

  //! token oluşturduktan sonra login() fonksiyonu oluşturuyoruz.
  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post<{token: string, expiresIn: number, userId: string}>( //? userId --> for authorization
      BACKEND_URL + "/login",
        authData
      )
      .subscribe(response => {
        // console.log(response); //{token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6I…Q5OX0.mdlKU_LXZHwGnr4AEOce-Sc9o2ODbNsXge4IzrZcpOg'}
        const token = response.token;
        this.token = token; //? we want to use that token in other parts of the app, we want to use it in the post service

        //* post-list'teki hatayı gidermek için
        if(token) {

          const expiresInDuration = response.expiresIn; //* Kullanıcıyı token'ın geçerlilik süresinin 60 dk olduğu konusunda uyarmak istiyoruz.
          // console.log(expiresInDuration) // 3600
          // this.tokenTimer = setTimeout(() => {
          //   this.logout();
          // }, expiresInDuration * 1000);
          this.setAuthTimer(expiresInDuration);
          //? logout func'da timeout'u clear etmeliyiz
          //* Ayrıca sayfa yenilendiğinde bu süreyi beklemeden logout olacak. Bunu önlemek adına token'ı localstorage gömeceğiz. Bunun için saveAuthData ve clearAuthData func oluşturuyoruz.


          this.isAuthenticated = true;

          //? for authorization
          this.userId = response.userId

          this.authStatusListener.next(true); //? we got a way of informing everyone who's interested about our user being authenticated

          //? Token implementing localstorage
          const now = new Date()
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000)
          console.log(expirationDate)
          this.saveAuthData(token, expirationDate, this.userId)

          this.router.navigate(['/'])
        }
      }, error => {
        this.authStatusListener.next(false)
      })
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false)

    //? token setTimeout death
    clearTimeout(this.tokenTimer)
    this.userId = null; //? logout olduğumuz zaman userId ' yi sıfırlamak gerekli
    this.clearAuthData();

    this.router.navigate(['/'])
  }

  //? AUTOMATICALLY AUTHENTICATE (TOKEN SÜRESİ DOLMADI İSE ÇALIŞIR)
  autoAuthUser() {
    const authInformation = this.getAuthData();
    //? logout yapıp bilgiler gittikten oluşacak error'u önlemek maksadıyla
    if(!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      //? for authorization
      this.userId = authInformation.userId;

      this.setAuthTimer(expiresIn / 1000)
      this.authStatusListener.next(true)
    }
  }
  //* autoAuthUser --> bu func'ı app.comp.ts'de ngOnInit ile çağırmamız mantıklı olur

  //? TOKEN COUNT DOWN TIMER
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  //? IMPLEMENT TOKEN TO LOCAL STORAGE
  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString())
    //? for authorization
    localStorage.setItem("userId", userId)
  }

  //? REMOVE TOKEN TO LOCAL STORAGE
  private clearAuthData() {
    localStorage.removeItem("token")
    localStorage.removeItem("expiration")
    //? for authorization
    localStorage.removeItem("userId")
  }

  //? GET TOKEN TO LOCAL STORAGE
  private getAuthData() {
    const token = localStorage.getItem("token")
    const expirationDate = localStorage.getItem("expiration")
    //? for authorization
    const userId = localStorage.getItem("userId")
    if(!token || !expirationDate) {
      return null
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      //? for authorization
      userId : userId
    }
  }
}
