import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { useMe } from "~/hooks/useMe";
import type { APIResponse, UserDto, MessageDto, ConversationDto } from "~/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { 
  SearchIcon, 
  SendIcon, 
  MessageSquareIcon, 
  UserPlusIcon, 
  ArrowLeftIcon,
  Loader2Icon
} from "lucide-react";
import { toast } from "sonner";

export default function MessagesRoute() {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Conversations List
  const { data: conversations = [], isLoading: isConversationsLoading } = useQuery<ConversationDto[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/messages/conversations");
      return res.data.data;
    },
    refetchInterval: 3000,
  });

  // Fetch User Search Results
  const { data: searchResults = [], isLoading: isSearching } = useQuery<UserDto[]>({
    queryKey: ["users-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await api.get<APIResponse>(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      return res.data.data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Fetch Chat History
  const { data: chatHistory = [], isLoading: isChatLoading } = useQuery<MessageDto[]>({
    queryKey: ["chat-history", selectedUserId],
    queryFn: async () => {
      const res = await api.get<APIResponse>(`/api/messages/${selectedUserId}`);
      return res.data.data;
    },
    enabled: !!selectedUserId,
    refetchInterval: 3000,
  });

  // Fetch Active Chat Partner User Details
  const activePartner = conversations.find((c) => c.user.id === selectedUserId)?.user || 
                        searchResults.find((u) => u.id === selectedUserId);

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post<APIResponse>("/api/messages", {
        receiverId: selectedUserId,
        content,
      });
      return res.data.data;
    },
    onSuccess: (newMessage) => {
      setMessageInput("");
      // Optimistic update of chat history
      queryClient.setQueryData<MessageDto[]>(["chat-history", selectedUserId], (old) => {
        if (!old) return [newMessage];
        return [...old, newMessage];
      });
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setTimeout(scrollToBottom, 50);
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sendMessageMutation.isPending || !selectedUserId) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when chat opens or new messages arrive
  useEffect(() => {
    if (chatHistory.length > 0) {
      scrollToBottom();
    }
  }, [chatHistory.length, selectedUserId]);

  const selectUserFromSearch = (user: UserDto) => {
    setSelectedUserId(user.id);
    setSearchQuery(""); // Clear search to show recent conversations
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-53px)] md:h-screen w-full bg-background overflow-hidden border-r">
      {/* LEFT SIDEBAR: Conversations List & Search */}
      <div
        className={`${
          selectedUserId ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 flex-col border-r border-border shrink-0 bg-card`}
      >
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search students or faculties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-none rounded-xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim().length > 0 ? (
            /* Search Results View */
            <div className="p-2 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground px-3 py-1 flex items-center gap-1">
                <UserPlusIcon className="h-3 w-3" />
                Search Results
              </p>
              {isSearching ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUserFromSearch(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent text-left transition-all"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">@{user.username || "student"}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No users found matching "{searchQuery}"</p>
              )}
            </div>
          ) : (
            /* Conversations List View */
            <div className="p-2 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground px-3 py-1">Recent Chats</p>
              {isConversationsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((chat) => {
                  const isActive = chat.user.id === selectedUserId;
                  const isSentByMe = chat.lastMessage.senderId === me?.id;
                  return (
                    <button
                      key={chat.user.id}
                      onClick={() => setSelectedUserId(chat.user.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[0.99]"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Avatar className="h-11 w-11 border-2 border-background/20">
                        <AvatarImage src={chat.user.image || undefined} alt={chat.user.name} />
                        <AvatarFallback>{getInitials(chat.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`font-semibold truncate ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                            {chat.user.name}
                          </p>
                          <span className={`text-[10px] shrink-0 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {formatTime(chat.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isActive ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                          {isSentByMe ? "You: " : ""}{chat.lastMessage.content}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4 space-y-2">
                  <MessageSquareIcon className="h-10 w-10 text-muted-foreground/60 mx-auto" />
                  <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/80">Search for students or faculty members above to start messaging.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Chat Area */}
      <div
        className={`${
          selectedUserId ? "flex" : "hidden md:flex"
        } flex-1 flex-col h-full bg-background`}
      >
        {selectedUserId && activePartner ? (
          <>
            {/* Chat Window Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUserId(null)}
                className="md:hidden"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={activePartner.image || undefined} alt={activePartner.name} />
                <AvatarFallback>{getInitials(activePartner.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground truncate">{activePartner.name}</h2>
                <p className="text-xs text-muted-foreground truncate">@{activePartner.username || "student"}</p>
              </div>
            </div>

            {/* Messages Scroll Thread */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10"
            >
              {isChatLoading && chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Loading chat history...</p>
                </div>
              ) : chatHistory.length > 0 ? (
                chatHistory.map((msg, index) => {
                  const isMe = msg.senderId === me?.id;
                  const showDateLabel =
                    index === 0 ||
                    formatDateLabel(chatHistory[index - 1].createdAt) !== formatDateLabel(msg.createdAt);

                  return (
                    <div key={msg.id} className="space-y-3">
                      {showDateLabel && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] font-semibold bg-muted px-2 py-1 rounded-md text-muted-foreground">
                            {formatDateLabel(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm leading-relaxed text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-card text-foreground border border-border rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <span
                            className={`block text-[9px] text-right mt-1 font-medium ${
                              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-12">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={activePartner.image || undefined} alt={activePartner.name} />
                    <AvatarFallback>{getInitials(activePartner.name)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-foreground">Say hello to {activePartner.name}!</p>
                  <p className="text-xs text-muted-foreground max-w-xs">This is the start of your message history with @{activePartner.username || "student"}.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-border bg-card flex items-center gap-2"
            >
              <Input
                placeholder={`Message ${activePartner.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="flex-1 rounded-xl bg-muted/40 border-none h-11"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                className="h-11 w-11 rounded-xl shrink-0 transition-transform active:scale-95"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          /* Empty Chat Area State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
            <div className="p-4 rounded-full bg-primary/10 mb-4 animate-bounce">
              <MessageSquareIcon className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Direct Messaging</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Select a fellow student or faculty member from your recent chats or start typing their name to send a direct message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
