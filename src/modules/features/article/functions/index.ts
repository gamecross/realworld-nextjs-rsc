import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export const convertMarkdownToHtml = async (markdown: string) => {
  const processed = await unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).process(markdown);

  return processed.toString();
};

type CurrentUser = { username: string } | undefined;

export const showFollowButton = (authorUsername: string, currentUser: CurrentUser) => {
  return authorUsername !== currentUser?.username;
};

export const showEditArticleButton = (authorUsername: string, currentUser: CurrentUser) => {
  return authorUsername === currentUser?.username;
};

export const showDeleteArticleButton = (authorUsername: string, currentUser: CurrentUser) => {
  return authorUsername === currentUser?.username;
};
