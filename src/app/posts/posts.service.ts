import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Post } from './post.model';

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  // private postsUpdated = new Subject<Post[]>();
  //? AFTER PAGINATION
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) { }

  //! HTTP GET METHOD

  // getPosts() {
  //   // this.http.get<{message: string, posts: Post[]}>('http://localhost:3000/api/posts')
  //   //   .subscribe((postData) => {
  //   //     this.posts = postData.posts;
  //   //     this.postsUpdated.next([...this.posts]);
  //   //   })

  //   //? Database'de id'nin başındaki underscore'u ortadan kaldırmak için yukarıdaki get metoduna pipe ekleyerek modifiye ediyoruz.
  //   this.http
  //     .get<{message: string, posts: any}>('http://localhost:3000/api/posts')
  //     .pipe(map((postData) => {
  //       return postData.posts.map((post: { title: string; content: string; _id: string; imagePath: string }) => {
  //         return {
  //           title: post.title,
  //           content: post.content,
  //           id: post._id,
  //           imagePath: post.imagePath
  //         }
  //       })
  //     }))
  //     .subscribe((transformedPosts) => {
  //       this.posts = transformedPosts;
  //       this.postsUpdated.next([...this.posts]);
  //     })
  // }

  //* IMPLEMENT PAGINATOR
  getPosts(postsPerPage: number, currentPage: number) {
    // this.http.get<{message: string, posts: Post[]}>('http://localhost:3000/api/posts')
    //   .subscribe((postData) => {
    //     this.posts = postData.posts;
    //     this.postsUpdated.next([...this.posts]);
    //   })

    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    //? Database'de id'nin başındaki underscore'u ortadan kaldırmak için yukarıdaki get metoduna pipe ekleyerek modifiye ediyoruz.
    this.http
      .get<{message: string; posts: any; maxPosts: number}>(BACKEND_URL + queryParams)
      .pipe(map(postData => {
        // return postData.posts.map((post: { title: string; content: string; _id: string; imagePath: string }) => {
        return { posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            //* for authorization
            creator: post.creator
          }
        }), maxPosts: postData.maxPosts }
      }))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
      })
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  //! ID İLE HERHANGİ BİR POSTU GET İLE ÇAĞIRMAK

  getPost(id:string) {
    // return {...this.posts.find(p => p.id === id)}
    //* UPDATE EDİLECEK OLAN POSTUN SAYFA YENİLENDİĞİNDE BİLGİLERİNİN GİTMEMESİ İÇİN YUKARIDAKİ YERİNE
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(BACKEND_URL + id)
  }


  //! HTTP POST METHOD

  // addPost(title: string, content: string) {
  //   const post: Post = {id: null, title: title, content: content};
  //   this.http
  //     // .post<{message: string}>('http://localhost:3000/api/posts', post)
  //     // .subscribe((responseData) => {
  //     //   console.log(responseData.message);
  //     //   this.posts.push(post);
  //     //   this.postsUpdated.next([...this.posts]);
  //     // })

  //     //? ID HATASINI GİDERMEK MAKSADYILA APP.JS DOSYASINDA YAPTIĞIMIZ DÜZELTMELERE EK OLARAK YUKARIDAKİ KODU MODİFİYE EDİYORUZ.
  //     .post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
  //     .subscribe((responseData) => {
  //       // console.log(responseData)
  //       const id = responseData.postId;
  //       post.id = id;
  //       this.posts.push(post);
  //       this.postsUpdated.next([...this.posts]);
  //       this.router.navigate(["/"]); //? post yaptıktan sonra ana sayfaya otomatik olarak navigate olsun
  //     })
  // }

  //* addPost fonksiyonunu sonradan eklediğimiz form ve image e göre modifiye ediyoruz.
  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title); //? burada "image" --> backend'deki post fonksiyonuna eklediğimiz argümandaki adıyla aynı olamsı lazım.
    this.http
      // .post<{message: string}>('http://localhost:3000/api/posts', post)
      // .subscribe((responseData) => {
      //   console.log(responseData.message);
      //   this.posts.push(post);
      //   this.postsUpdated.next([...this.posts]);
      // })

      //? ID HATASINI GİDERMEK MAKSADYILA APP.JS DOSYASINDA YAPTIĞIMIZ DÜZELTMELERE EK OLARAK YUKARIDAKİ KODU MODİFİYE EDİYORUZ.
      // .post<{message: string, postId: string}>('http://localhost:3000/api/posts', postData) //? backend'de spread operatörü kullandığımız için aşağıdaki şekilde modifiye ediyoruz.
      .post<{message: string, post: Post}>(BACKEND_URL, postData)
      .subscribe((responseData) => {

        //* AFTER PAGINATION WE REMOVE NOT REQUİRE ANYMORE
        // // console.log(responseData)
        // const post: Post = {
        //   // id: responseData.postId, //? backend'de spread operatörü kullandığımız için aşağıdaki şekilde modifiye ediyoruz.
        //   id: responseData.post.id,
        //   title: title,
        //   content: content,
        //   imagePath: responseData.post.imagePath
        // }
        // this.posts.push(post);
        // this.postsUpdated.next([...this.posts]);

        this.router.navigate(["/"]); //? post yaptıktan sonra ana sayfaya otomatik olarak navigate olsun
      })
  }


  //! HTTP PUT METHOD

  // updatePost(id:string, title:string, content: string) {
  //   const post: Post = {id: id, title: title, content: content, imagePath: null};
  //   //? Yukarıdaki işlemden sonra bu request'i göndermek için backend kısmında route ihtiyacımız var.
  //   this.http
  //     .put("http://localhost:3000/api/posts/" + id, post)
  //     .subscribe(response => {
  //       const updatedPosts = [...this.posts];
  //       const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
  //       updatedPosts[oldPostIndex] = post;
  //       this.posts = updatedPosts;
  //       this.postsUpdated.next([...this.posts]);
  //       this.router.navigate(["/"]); //? put yaptıktan sonra ana sayfaya otomatik olarak kanalize olsun
  //     })
  // }

  //* image update olayı için tekrardan modifiye ediyoruz.
  updatePost(id:string, title:string, content: string, image: File | string) {
    //* check what we have
    let postData: Post | FormData;
    if(typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title); //? title --> file name
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        //? for auth
        creator: null //* --> we will be handling in server
      }
    }

    this.http
      .put(BACKEND_URL + id, postData)
      .subscribe(response => {

        //* AFTER PAGINATION WE REMOVE NOT REQUİRE ANYMORE
        // const updatedPosts = [...this.posts];
        // const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        // const post: Post = {
        //   id: id,
        //   title: title,
        //   content: content,
        //   imagePath: ""
        // }
        // updatedPosts[oldPostIndex] = post;
        // this.posts = updatedPosts;
        // this.postsUpdated.next([...this.posts]);

        this.router.navigate(["/"]); //? put yaptıktan sonra ana sayfaya otomatik olarak kanalize olsun
      })
  }


  //! HTTP DELETE METHOD

  deletePost(postId: string) {
    // this.http.delete("http://localhost:3000/api/posts/" + postId)
    //   .subscribe(() => {
    //     // console.log("Post deleted!")
    //     //? sayfa yenilemeden postun ekrandan kaybolması için aşağıdaki satırları yazıyoruz.
    //     const updatedPosts = this.posts.filter(post => post.id !== postId); //? sildiğimiz postun id'sine eşit olmayanları yeni bir array'e atıyoruz.
    //     this.posts = updatedPosts;
    //     this.postsUpdated.next([...this.posts]) //? tüm app'in haberinin olması için postUpdated'e posts'u send ediyoruz.
    //   })

    //*//* AFTER PAGINATION WE REMOVE AND MODIFY UPPER CODES
      return this.http.delete(BACKEND_URL + postId);
  }
}


