export interface SplitOptions { limit: number; labels: boolean }
export interface Post { text: string; length: number; fits: boolean }
export interface SplitResult { posts: Post[]; warnings: string[] }
