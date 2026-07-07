import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "react-toastify";
import { useLanguage } from "@/context/LanguageContext";
import { selectuser } from "@/Feature/Userslice";

type User = {
  uid: string;
  photo?: string;
  name?: string;
  email?: string;
};

type Post = {
  _id: string;
  user_id: string;
  username: string;
  photo: string;
  caption: string;
  media_url: string;
  media_type: string;
  created_at: string;
  likeCount: number;
  commentCount: number;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

export default function PublicSpace() {
  const { t } = useLanguage();
  const user = useSelector(selectuser) as User | null;

  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }, []);

  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "">("");

  // Minimal media handling: expects media_url from user input or pasted URL.
  // This keeps modifications small without introducing new upload/storage stack.
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const [commentTextByPost, setCommentTextByPost] = useState<Record<string, string>>({});
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [eligibility, setEligibility] = useState<{
    locked: boolean;
    lockReason?: string | null;
    friendCount?: number | null;
    limit?: number | "Infinity";
    postsLast24h?: number | null;
  } | null>(null);

  const fetchEligibility = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${apiBase}/api/public-space/eligibility`, {
        params: { user_id: user.uid },
      });
      setEligibility(res.data?.ok ? res.data : null);
    } catch (e) {
      console.error(e);
      setEligibility(null);
    }
  };

  useEffect(() => {
    fetchEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/public-space/posts`);
      setPosts(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateMedia = (type: string) => {
    if (type !== "image" && type !== "video") return false;
    return true;
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Login required");
      return;
    }

    if (eligibility?.locked) {
      toast.error(eligibility?.lockReason || "Posting is locked");
      return;
    }

    const hasCaption = caption.trim().length > 0;
    const hasMedia = mediaUrl.trim().length > 0;

    if (!hasCaption && !hasMedia) {
      toast.error("Post cannot be empty");
      return;
    }

    if (mediaType && !validateMedia(mediaType)) {
      toast.error("Unsupported media type");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${apiBase}/api/public-space/posts`, {
        user_id: user.uid,
        username: user.name || "",
        photo: user.photo || "",
        caption,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      toast.success("Post created");
      setCaption("");
      setMediaUrl("");
      setMediaType("");
      await fetchEligibility();
      fetchPosts();
    } catch (err: any) {
      const message = err?.response?.data?.error;
      toast.error(message || "Failed to create post");
      await fetchEligibility();
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.error("Login required");
      return;
    }

    try {
      const res = await axios.post(`${apiBase}/api/public-space/posts/${postId}/like`, {
        user_id: user.uid,
      });
      const likeCount = res.data?.likeCount ?? 0;
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likeCount } : p)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to like");
    }
  };

  const loadComments = async (postId: string) => {
    setCommentsLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/public-space/posts/${postId}/comments`);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res.data || [] }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const addComment = async (postId: string) => {
    if (!user) {
      toast.error("Login required");
      return;
    }

    const text = (commentTextByPost[postId] || "").trim();
    if (!text) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const res = await axios.post(`${apiBase}/api/public-space/posts/${postId}/comments`, {
        user_id: user.uid,
        username: user.name || "",
        comment: text,
      });

      const created = res.data?.comment;
      setCommentsByPost((prev) => {
        const cur = prev[postId] || [];
        return { ...prev, [postId]: [...cur, created] };
      });

      setCommentTextByPost((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Failed to add comment");
    }
  };

  const sharePost = async (postId: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/public-space?post=${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Post", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      // clipboard may fail
      toast.error("Unable to share");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Public Space</h1>
        <p className="text-gray-600 mt-2">Community posts from registered users.</p>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something..."
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Media URL</label>
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Paste an image/video URL (optional)"
                className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Media Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as any)}
                className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || eligibility?.locked}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Posting..." : eligibility?.locked ? "Posting Locked" : "Submit Post"}
          </button>

          <div className="text-xs text-gray-500">
            {eligibility?.locked ? (
              <>
                {eligibility.lockReason || "You cannot post right now."}
              </>
            ) : eligibility ? (
              <>Posting enabled.</>
            ) : (
              <>Checking posting eligibility...</>
            )}
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <div className="text-gray-600">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-gray-600">No posts yet.</div>
        ) : (
          posts.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start gap-3">
                <img
                  src={p.photo || "/file.svg"}
                  alt=""
                  className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{p.username || "User"}</div>
                    <div className="text-xs text-gray-500">{formatDate(p.created_at)}</div>
                  </div>
                  {p.caption ? <div className="text-gray-800 mt-2 whitespace-pre-wrap">{p.caption}</div> : null}

                  {p.media_url ? (
                    <div className="mt-3">
                      {p.media_type === "video" ? (
                        <video src={p.media_url} controls className="w-full rounded-lg" />
                      ) : (
                        <img src={p.media_url} alt="" className="w-full rounded-lg object-cover" />
                      )}
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => toggleLike(p._id)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                      Like ({p.likeCount})
                    </button>
                    <button
                      onClick={() => {
                        const next = openCommentsFor === p._id ? null : p._id;
                        setOpenCommentsFor(next);
                        if (next) loadComments(p._id);
                      }}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                      Comment ({p.commentCount})
                    </button>
                    <button
                      onClick={() => sharePost(p._id)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                      Share
                    </button>
                    <Link href={`/profile`} className="ml-auto text-blue-600 text-sm">
                      View Profile
                    </Link>
                  </div>

                  {openCommentsFor === p._id && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Comments</div>

                      {commentsLoading && !commentsByPost[p._id] ? (
                        <div className="text-gray-600 text-sm">Loading...</div>
                      ) : (
                        (commentsByPost[p._id] || []).length === 0 ? (
                          <div className="text-gray-600 text-sm">No comments yet.</div>
                        ) : (
                          <div className="space-y-2">
                            {(commentsByPost[p._id] || []).map((c, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs text-gray-500">
                                  {c.username || "User"} • {formatDate(c.created_at)}
                                </div>
                                <div className="text-gray-800 mt-1 text-sm">{c.comment}</div>
                              </div>
                            ))}
                          </div>
                        )
                      )}

                      <div className="mt-3 flex gap-2">
                        <input
                          value={commentTextByPost[p._id] || ""}
                          onChange={(e) =>
                            setCommentTextByPost((prev) => ({ ...prev, [p._id]: e.target.value }))
                          }
                          placeholder="Write a comment..."
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => addComment(p._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

