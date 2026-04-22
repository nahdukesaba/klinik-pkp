import "server-only";

const INSTAGRAM_USERNAME = "bp3kp_sumatera2";
const INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
const INSTAGRAM_FEED_URL = `https://www.instagram.com/api/v1/feed/user/${INSTAGRAM_USERNAME}/username/?count=3`;

const INSTAGRAM_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "X-IG-App-ID": "936619743392459",
  Referer: INSTAGRAM_PROFILE_URL,
} as const;

interface InstagramFeedItem {
  id?: string;
  code?: string;
  display_uri?: string;
  thumbnail_url?: string;
  image_versions2?: {
    candidates?: Array<{
      url?: string;
      width?: number;
    }>;
  };
}

interface InstagramResponseUser {
  username?: string;
  full_name?: string;
  profile_pic_url?: string;
}

interface InstagramFeedResponse {
  user?: InstagramResponseUser;
  items?: InstagramFeedItem[];
  profile_grid_items?: InstagramFeedItem[];
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  profilePictureUrl: string;
  href: string;
}

export interface InstagramPreviewPost {
  id: string;
  href: string;
  imageUrl: string;
}

export interface InstagramPreview {
  profile: InstagramProfile;
  posts: InstagramPreviewPost[];
}

const FALLBACK_PROFILE: InstagramProfile = {
  username: INSTAGRAM_USERNAME,
  fullName: "Balai P3KP Sumatera II",
  profilePictureUrl: "/logo-bp3kp.png",
  href: INSTAGRAM_PROFILE_URL,
};

function getBestImageUrl(item: InstagramFeedItem) {
  if (item.display_uri) {
    return item.display_uri;
  }

  if (item.thumbnail_url) {
    return item.thumbnail_url;
  }

  const bestCandidate = item.image_versions2?.candidates
    ?.slice()
    .sort((left, right) => (right.width ?? 0) - (left.width ?? 0))[0];

  return bestCandidate?.url ?? null;
}

function mapPost(item: InstagramFeedItem): InstagramPreviewPost | null {
  const imageUrl = getBestImageUrl(item);

  if (!item.id || !item.code || !imageUrl) {
    return null;
  }

  return {
    id: item.id,
    href: `https://www.instagram.com/p/${item.code}/`,
    imageUrl,
  };
}

export async function getInstagramPreview(limit = 3): Promise<InstagramPreview> {
  try {
    const response = await fetch(INSTAGRAM_FEED_URL, {
      method: "GET",
      headers: INSTAGRAM_HEADERS,
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(3_500),
    });

    if (!response.ok) {
      throw new Error(`Instagram request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as InstagramFeedResponse;
    const postsSource = payload.profile_grid_items ?? payload.items ?? [];
    const posts = postsSource
      .map(mapPost)
      .filter((item): item is InstagramPreviewPost => item !== null)
      .slice(0, limit);

    return {
      profile: {
        username: payload.user?.username || FALLBACK_PROFILE.username,
        fullName: payload.user?.full_name || FALLBACK_PROFILE.fullName,
        profilePictureUrl:
          payload.user?.profile_pic_url || FALLBACK_PROFILE.profilePictureUrl,
        href: FALLBACK_PROFILE.href,
      },
      posts,
    };
  } catch {
    return {
      profile: FALLBACK_PROFILE,
      posts: [],
    };
  }
}
