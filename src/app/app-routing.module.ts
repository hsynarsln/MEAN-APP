import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { PostListComponent } from './posts/post-list/post-list.component';

const routes: Routes = [{
  path: '', component: PostListComponent
},
{
  path: 'create', component: PostCreateComponent, canActivate: [AuthGuard]
},
{
  path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard]
},
{
  path: "login", component: LoginComponent
},
{
  path: "signup", component: SignupComponent
},
//? performans açısından verimi artırmak amacıyla login ve signup routingleri ihtiyaç olduğu zaman çağırıyoruz.(lazyLoading)
// {
//   path: "auth", loadChildren: "./app.module#AuthModule"
  // path: "auth", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
// }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
