//! FRONTEND MODEL

export interface Post {
  id: string,
  title: string;
  content: string;
  imagePath: string;
  //? for auth
  creator: string;
}
