import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import type { User } from "@/utils/types/models";

export const showFollowButton = (authorUsername: string, currentUser?: Pick<User, "username">) =>
  authorUsername !== currentUser?.username;

export const showEditArticleButton = (authorUsername: string, currentUser?: Pick<User, "username">) =>
  !!currentUser && authorUsername === currentUser.username;

export const showDeleteArticleButton = (authorUsername: string, currentUser?: Pick<User, "username">) =>
  !!currentUser && authorUsername === currentUser.username;

export const convertMarkdownToHtml = async (markdown: string) => {
  const processed = await unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).process(markdown);

  return processed.toString();
};
