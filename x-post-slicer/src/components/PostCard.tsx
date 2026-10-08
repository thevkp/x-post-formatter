import type { Post } from "../core/splitter";
import { CopyButton } from "./CopyButton";

interface Props { post: Post; index: number; limit: number; done: boolean; isNext: boolean; onCopied: () => void }

export function PostCard({ post, index, limit, done, isNext, onCopied }: Props) {
  const cls = ["post", post.fits ? "" : "bad", done ? "done" : "", isNext ? "next" : ""].join(" ").trim();
  return (
    <li className={cls}>
      <p className="post-text">{post.text}</p>
      <div className="post-foot">
        <span>
          Post {index + 1}: {post.length}/{limit} {post.fits ? "✓ fits" : "✗ too long"}
          {done && " · ✓ copied"}{isNext && " · ➜ next"}
        </span>
        <CopyButton text={post.text} onCopied={onCopied} />
      </div>
    </li>
  );
}
