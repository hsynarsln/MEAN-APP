import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  private postsSub: Subscription;
  //? SPINNER
  isLoading = false;
  //? PAGINATOR
  totalPosts = 0;
  postsPerPage = 2;
  currentPage= 1;
  pageSizeOptions = [1, 2, 5, 10];
  //? if(auth) --> show del && edit buttons
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  //? for authorization
  userId: string;

  constructor(public postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    //? spinner start
    this.isLoading = true;
    // this.postsService.getPosts();
    //? IMPLEMENT PAGINATOR
    this.postsService.getPosts(this.postsPerPage, this.currentPage); //* 1 --> as our current page
    //? for authorization
    this.userId = this.authService.getUserId();

    this.postsSub = this.postsService.getPostUpdateListener()
      // .subscribe((posts: Post[])=> {
      //   //? spinner end
      //   this.isLoading = false;
      //   this.posts = posts;
      // });
      //* service.ts'deki postsUpdated objesini değiştirdikten sonra burayı da aşağıdaki gibi değiştirmeliyiz.
      .subscribe((postData: {posts: Post[], postCount: number})=> {
        //? spinner end
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });

      //? post-list'teki hatayı gidermek için
      this.userIsAuthenticated = this.authService.getIsAuth();
      //? if(auth) --> show del && edit buttons (!but we created a new info, we don't fetch the current info here --> so we fix this auth.service.ts'a gidiyoruz.)
      this.authStatusSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          //? for authorization
          this.userId = this.authService.getUserId();
      })
  }


  //? PAGINATOR
  onChangedPage(pageData: PageEvent) {
    // console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1; //? +1 --> because of starts at zero
    this.postsPerPage = pageData.pageSize; //? selected by the user dropdown
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    // this.postsService.deletePost(postId);
    //* AFTER SERVICE.TS' DEKİ DELETE METHODUNU GÜNCELLEDİKTEN SONRA
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      //* DELETE YAPTIKTAN SONRA PAGINATION DEĞERLERİNİN KENDİNİ GÜNCEL DURUMA GÖRE AYARLAMASI
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false; //? yetkili olmayan bir kişinin delete yapması sonucu hata vermesine rağmen spinner true olduğu için subscribe sonrası ikinci bir argüman olarak spinner false veriyoruz ve spinner'ı ortadan kaldırıyoruz.
    })
  }


  ngOnDestroy() {
    this.postsSub.unsubscribe();
    //? if(auth) --> show del && edit buttons
    this.authStatusSub.unsubscribe();
  }
}
