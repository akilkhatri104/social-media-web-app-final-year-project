export type APIResponse = {
    data: any;
    status: number;
    message: string;
    success: boolean;
};

export type NotificationType =
    | "like"
    | "comment"
    | "repost"
    | "follow"
    | "quote"
    | "mention";

export type NotificationSettingsDto = {
    inAppLikes: boolean;
    inAppComments: boolean;
    inAppReposts: boolean;
    inAppFollows: boolean;
    inAppQuotes: boolean;
    inAppMentions: boolean;
    emailEnabled: boolean;
    emailLikes: boolean;
    emailComments: boolean;
    emailReposts: boolean;
    emailFollows: boolean;
    emailQuotes: boolean;
    emailMentions: boolean;
};

export type NotificationDto = {
    id: number;
    recipientId: string;
    actorId: string;
    type: NotificationType;
    postId: number | null;
    readAt: string | null;
    createdAt: string;
    actor?: {
        id: string;
        name: string | null;
        username: string | null;
        displayUsername: string | null;
        image: string | null;
    };
    post?: {
        id: number;
        content: string;
    } | null;
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

export type UserDto = {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
};

export type MessageDto = {
    id: number;
    senderId: string;
    receiverId: string;
    content: string;
    parentMessageId?: number | null;
    createdAt: string;
    updatedAt: string;
    sender?: UserDto;
    receiver?: UserDto;
    parentMessage?: MessageDto | null;
};

export type ConversationDto = {
    user: UserDto;
    lastMessage: {
        id: number;
        content: string;
        senderId: string;
        receiverId: string;
        createdAt: string;
    };
};

export type TrendingHashtag = {
    name: string;
    postCount: number;
};

export type ExploreResponse = {
    trendingHashtags: TrendingHashtag[];
    popularPosts: PostDto[];
};

export type SearchUserResult = {
    id: string;
    name: string;
    username: string | null;
    displayUsername: string | null;
    image: string | null;
    bio: string | null;
};

export type SearchHashtagResult = {
    name: string;
    postCount: number;
};

export type SearchResponse = {
    query: string;
    users: SearchUserResult[];
    hashtags: SearchHashtagResult[];
    posts: PostDto[];
};
