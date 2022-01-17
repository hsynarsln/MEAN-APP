import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  //? ID İLE GET İŞLEMİ İÇİN
  private mode = 'create';
  private postId: string;
  post: Post;
  form: FormGroup;
  //? SPINNER
  isLoading = false;
  //? IMAGE PREVIEW
  imagePreview: string;

  private authStatusSub: Subscription;


  constructor(public postsService: PostsService, public route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    //*if that changes, we'll always need to disable the loader
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false
      })

    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      content: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]}) //? image'i HTML de herhangi bir yere bind etmeyeceğiz. Sadece TS kodu içerisinde arka planda çalışacak.
      //*mimeType ---> asyncValidators
    })
    //? EDIT İLE ADD FONKSİYONLARINI AYIRMAK İÇİN AŞAĞIDAKİ CONDITION'I KURUYORUZ. ID İLE GET YAPIYORUZ
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        // this.post = this.postsService.getPost(this.postId); //*paramMap ile elde ettiğimiz id'yi service'te oluşturduğumuz function'a atayarak postumuzu elde ediyoruz.
        //? UPDATE EDİLECEK OLAN POSTUN SAYFA YENİLENDİĞİNDE BİLGİLERİNİN GİTMEMESİ İÇİN YUKARIDAKİ YERİNE
        //? spinner start
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          //? spinner end
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath, //? imagePath --> yet not get
            //? for auth
            creator: postData.creator
          }
          //? REACTIVE FORM'A GEÇTİKTEN SONRA FORM'U "setValue()" ile initial "null" ları değiştiriyoruz. set the values of all inputs or all controls
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            //? ----------------
            image: this.post.imagePath
          })
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    })
  }


  onImagePicked(event:Event) {
    const file = (event.target as HTMLInputElement).files[0]; //? Typescript'e event.target'in bir HTMLInputElement olduğunu söyledik. Yoksa hata veriyor.
    this.form.patchValue({image: file}); //? allows us to target a single control (<-- setValue'den farkı )
    this.form.get('image').updateValueAndValidity(); //? informs angular that i changed the value and it should re-evaluate that, store that value internally and also check whether the value i did patch is valid
    // console.log(file);
    // console.log(this.form.value)

    //? IMAGE PREVIEW
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string; //? as string --> olarak yapmadığımızda hata alıyoruz.
    }
    reader.readAsDataURL(file);
  }

  //! NOTE: REACTIVE FORM'A GEÇTİKTEN SONRA FORM VALUE'LARIN BAŞINA "this" EKLEDİK.
  onSavePost() {
    if(this.form.invalid) {
      return;
    }
    //? spinner start (sayfa navigate olduğu için spinner'ı kapatmaya gerek yok)
    this.isLoading = true;
    if (this.mode === "create") {
      // console.log(form.value)
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset();
  }

  ngOnDestroy(): void {
      this.authStatusSub.unsubscribe()
  }
}
