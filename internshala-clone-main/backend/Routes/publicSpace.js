const express = require("express");
const router = express.Router();

const Post = require("../Model/Post");
const Like = require("../Model/Like");
const Comment = require("../Model/Comment");
const Friendship = require("../Model/Friendship");

async function getFriendsCount(user_id) {
  // Friend count = number of accepted friendships involving this user.
  return Friendship.countDocuments({
    status: "accepted",
    $or: [{ requesterId: user_id }, { accepterId: user_id }],
  });
}

function allowedDailyLimit(friendCount) {
  if (!friendCount || friendCount <= 0) return 0;
  if (friendCount === 1) return 1;
  if (friendCount === 2) return 2;
  if (friendCount >= 3 && friendCount <= 10) return friendCount;
  return Infinity; // >10
}

function rolling24hStart() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000);
}

async function getPostingStats(user_id) {
  const friendCount = await getFriendsCount(user_id);
  const limit = allowedDailyLimit(friendCount);

  if (limit === 0) {
    return { friendCount, limit, postsLast24h: 0, locked: true, lockReason: "You need at least one friend before posting." };
  }

  if (limit === Infinity) {
    return { friendCount, limit, postsLast24h: 0, locked: false, lockReason: null };
  }

  const postsLast24h = await Post.countDocuments({
    user_id,
    created_at: { $gte: rolling24hStart() },
  });

  const locked = postsLast24h >= limit;
  return {
    friendCount,
    limit,
    postsLast24h,
    locked,
    lockReason: locked ? "Daily posting limit reached." : null,
  };
}

router.get("/eligibility", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id || typeof user_id !== "string") {
      return res.status(401).json({ error: "Login required" });
    }

    const stats = await getPostingStats(user_id);

    res.json({
      ok: true,
      ...stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get posting eligibility" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const {
      user_id,
      username,
      photo,
      caption,
      media_url,
      media_type,
      // friendsCount intentionally ignored; backend enforces based on Friendship model
    } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: "Login required" });
    }

    const hasCaption = typeof caption === "string" && caption.trim().length > 0;
    const hasMedia = typeof media_url === "string" && media_url.trim().length > 0;

    // Prevent empty posts
    if (!hasCaption && !hasMedia) {
      return res.status(400).json({ error: "Post cannot be empty" });
    }

    // Basic media validation (common formats)
    const allowed = new Set(["image", "video", ""]);
    if (!allowed.has(media_type)) {
      return res.status(400).json({ error: "Unsupported media type" });
    }

    // Posting restriction logic (rolling last 24 hours)
    const { limit, locked, lockReason } = await getPostingStats(user_id);
    if (locked) {
      return res.status(403).json({ error: lockReason || "Posting is locked" });
    }

    const post = new Post({
      user_id,
      username: username || "",
      photo: photo || "",
      caption: caption || "",
      media_url: media_url || "",
      media_type: media_type || "",
    });

    await post.save();

    res.status(201).json({
      ok: true,
      post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ created_at: -1 }).lean();

    const postIds = posts.map((p) => p._id);

    const likes = await Like.aggregate([
      { $match: { post_id: { $in: postIds } } },
      { $group: { _id: "$post_id", count: { $sum: 1 } } },
    ]);

    const comments = await Comment.aggregate([
      { $match: { post_id: { $in: postIds } } },
      { $group: { _id: "$post_id", count: { $sum: 1 } } },
    ]);

    const likeCountMap = new Map(likes.map((x) => [String(x._id), x.count]));
    const commentCountMap = new Map(comments.map((x) => [String(x._id), x.count]));

    res.json(
      posts.map((p) => ({
        ...p,
        likeCount: likeCountMap.get(String(p._id)) || 0,
        commentCount: commentCountMap.get(String(p._id)) || 0,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.post("/posts/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id } = req.body;
    if (!user_id) return res.status(401).json({ error: "Login required" });

    const existing = await Like.findOne({ post_id: postId, user_id });
    if (existing) {
      await Like.deleteOne({ _id: existing._id });
    } else {
      await Like.create({ post_id: postId, user_id });
    }

    const likeCount = await Like.countDocuments({ post_id: postId });
    res.json({ ok: true, likeCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like/unlike" });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const data = await Comment.find({ post_id: postId })
      .sort({ created_at: 1 })
      .select("user_id username comment created_at")
      .lean();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { user_id, username, comment } = req.body;
    if (!user_id) return res.status(401).json({ error: "Login required" });
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    const c = await Comment.create({
      post_id: postId,
      user_id,
      username: username || "",
      comment: comment.trim(),
    });

    res.status(201).json({ ok: true, comment: c });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Share is purely frontend (copy link / native share)

module.exports = router;

