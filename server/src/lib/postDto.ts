type PostRecord = {
  id: number;
  userId: string;
  parentPostId: number | null;
  quotedPostId: number | null;
  content: string;
  visibility: 'public' | 'followers' | null;
  createdAt: Date;
  updatedAt: Date;

  author?: any;
  media?: any[];
  likes?: any[];
  comments?: any[];
  reposts?: any[];
  quotePosts?: any[];
  parentPost?: any | null;
  quotedPost?: PostRecord | null;
};

type PostDto = {
  id: number;
  userId: string;
  parentPostId: number | null;
  quotedPostId: number | null;
  content: string;
  visibility: 'public' | 'followers' | null;
  createdAt: Date;
  updatedAt: Date;

  author: any | null;
  media: any[];
  parentPost: {
    id: number;
    userId: string;
    content: string;
    createdAt: Date;
    author: any | null;
  } | null;

  quotedPost: PostDto | null;

  likeCount: number;
  commentCount: number;
  repostCount: number;
};

export function toPostDto(post: PostRecord): PostDto {
  return {
    id: post.id,
    userId: post.userId,
    parentPostId: post.parentPostId ?? null,
    quotedPostId: post.quotedPostId ?? null,
    content: post.content,
    visibility: post.visibility ?? 'public',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,

    author: post.author ?? null,
    media: post.media ?? [],

    parentPost: post.parentPost
      ? {
          id: post.parentPost.id,
          userId: post.parentPost.userId,
          content: post.parentPost.content,
          createdAt: post.parentPost.createdAt,
          author: post.parentPost.author ?? null,
        }
      : null,

    quotedPost: post.quotedPost ? toPostDtoShallow(post.quotedPost) : null,

    likeCount: post.likes?.length ?? 0,
    commentCount: post.comments?.length ?? 0,
    repostCount: (post.reposts?.length ?? 0) + (post.quotePosts?.length ?? 0),
  };
}

function toPostDtoShallow(post: PostRecord): PostDto {
  return {
    id: post.id,
    userId: post.userId,
    parentPostId: post.parentPostId ?? null,
    quotedPostId: post.quotedPostId ?? null,
    content: post.content,
    visibility: post.visibility ?? 'public',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,

    author: post.author ?? null,
    media: post.media ?? [],

    parentPost: post.parentPost
      ? {
          id: post.parentPost.id,
          userId: post.parentPost.userId,
          content: post.parentPost.content,
          createdAt: post.parentPost.createdAt,
          author: post.parentPost.author ?? null,
        }
      : null,

    quotedPost: null,

    likeCount: post.likes?.length ?? 0,
    commentCount: post.comments?.length ?? 0,
    repostCount: (post.reposts?.length ?? 0) + (post.quotePosts?.length ?? 0),
  };
}
