export type APIResponse = {
    data: any;
    status: number;
    message: string;
    success: boolean;
};

export type PostDto = {
    id: number;
    userId: string;
    parentPostId: number | null;
    quotedPostId: number | null;
    content: string;
    visibility: "public" | "followers" | null;
    createdAt: string;
    updatedAt: string;
    author: any | null;
    media: any[];
    hashtags: string[];
    parentPost: any | null;
    quotedPost: PostDto | null;
    likeCount: number;
    commentCount: number;
    repostCount: number;
};

export type FeedItem =
    | {
          itemType: "post";
          createdAt: string;
          post: PostDto;
      }
    | {
          itemType: "repost";
          createdAt: string;
          repostedBy: any;
          originalPost: PostDto;
      };

export type TrendingHashtag = {
    name: string;
    postCount: number;
};

export type ExploreResponse = {
    trendingHashtags: TrendingHashtag[];
    popularPosts: PostDto[];
};
