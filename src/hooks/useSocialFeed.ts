import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SortKey } from "../enums/social";
import { notificationService } from "../services/notificationService";
import { socialService, SocialFeedItem } from "../services/socialService";

import { useAuth } from "./useAuth";
import { useNotificationCenter } from "./useNotificationCenter";


type UseSocialFeedResult = {
  feed: SocialFeedItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  onRefresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  handleLike: (id: string) => Promise<void>;
  notificationsAvailable?: boolean;
  unreadCount?: number;
};

export function useSocialFeed(): UseSocialFeedResult {
  const { user } = useAuth();
  const { clearUnread, notificationsAvailable, unreadCount } =
    useNotificationCenter();

  const [feed, setFeed] = useState<SocialFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<SortKey>("recent");

  const PAGE_SIZE = 20;

  const refreshLikesForNote = useCallback(
    async (noteId: string) => {
      try {
        const likes = await socialService.getLikes(noteId);
        const currentUserId = user?.id;
        const likedByMe = Array.isArray(likes.users)
          ? likes.users.some((u: any) => {
              const uid = u?.id || u?.userId || u?._id;
              const uemail = u?.email;
              return (
                (currentUserId && uid === currentUserId) ||
                (!!user?.email && uemail && uemail === user.email)
              );
            })
          : false;
        setFeed((prev) => {
          const next = prev.map((n) =>
            n.id === noteId ? { ...n, likeCount: likes.total, likedByMe } : n
          );
          const note = next.find((n) => n.id === noteId);
          if (
            notificationsAvailable &&
            note &&
            (note as any).userId &&
            user?.id &&
            (note as any).userId === user.id
          ) {
            notificationService
              .presentLocalNotification({
                title: "New like on your note",
                body: `${note.title || "Untitled"} now has ${
                  likes.total
                } likes`,
                data: { url: `task-2://note/${noteId}` },
              })
              .catch(() => {});
          }
          return next;
        });
      } catch (e) {
        console.warn(`[Social] Failed to fetch likes for note ${noteId}`, e);
      }
    },
    [user?.id, user?.email, notificationsAvailable]
  );

  const refreshLikesForNotes = useCallback(
    async (noteIds: string[]) => {
      const limitedBatchSize = 6;
      for (let i = 0; i < noteIds.length; i += limitedBatchSize) {
        const batch = noteIds.slice(i, i + limitedBatchSize);
        await Promise.all(batch.map((id) => refreshLikesForNote(id)));
      }
    },
    [refreshLikesForNote]
  );

  const loadFeed = useCallback(
    async (reset: boolean = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const currentOffset = reset ? 0 : offset;
        const data = await socialService.getFeed(
          PAGE_SIZE,
          currentOffset,
          sort
        );
        setHasMore(!!data.hasMore);
        if (reset) {
          setFeed(data.notes);
          setOffset(PAGE_SIZE);
        } else {
          setFeed((prev) => {
            const next = [...prev, ...data.notes];
            const unique = Array.from(
              new Map(next.map((n) => [n.id, n])).values()
            );
            return unique;
          });
          setOffset(currentOffset + PAGE_SIZE);
        }
        const ids = data.notes.map((n) => n.id);
        refreshLikesForNotes(ids).catch(() => {});
      } finally {
        setLoading(false);
      }
    },
    [loading, offset, sort, refreshLikesForNotes]
  );

  useEffect(() => {
    loadFeed(true);
  }, [sort]);

  useFocusEffect(
    useCallback(() => {
      clearUnread();
      let active = true;
      const id = setInterval(() => {
        if (active && !loading) {
          loadFeed(true);
        }
      }, 20000);
      return () => {
        active = false;
        clearInterval(id);
      };
    }, [clearUnread, loadFeed, loading])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFeed(true);
      const ids = feed.map((n) => n.id);
      await refreshLikesForNotes(ids);
    } finally {
      setRefreshing(false);
    }
  }, [loadFeed, refreshLikesForNotes, feed]);

  const handleLike = useCallback(
    async (id: string) => {
      setFeed((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                likedByMe: true,
                likeCount: (n.likeCount || 0) + (n.likedByMe ? 0 : 1),
              }
            : n
        )
      );

      try {
        const res = await socialService.likeNote(id);
        setFeed((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...res } : n))
        );
        await refreshLikesForNote(id);
      } catch (e) {
        setFeed((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  likedByMe: false,
                  likeCount: Math.max((n.likeCount || 1) - 1, 0),
                }
              : n
          )
        );
      }
    },
    [refreshLikesForNote]
  );

  const sortedFeed = useMemo(() => {
    const items = [...feed];
    if (sort === "mostLiked") {
      return items.sort((a, b) => {
        const la = a.likeCount || 0;
        const lb = b.likeCount || 0;
        if (lb !== la) return lb - la;
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return tb - ta;
      });
    }
    return items.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return tb - ta;
    });
  }, [feed, sort]);

  return {
    feed: sortedFeed,
    loading,
    refreshing,
    hasMore,
    sort,
    setSort,
    onRefresh,
    loadMore: () => loadFeed(false),
    handleLike,
    notificationsAvailable,
    unreadCount,
  };
}
