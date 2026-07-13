import { Pagination, PaginationItem } from "@/modules/common/components/pagination";
import { calcTotalPageNumber } from "@/modules/common/functions/pagination";
import { ArticleCard } from "@/modules/features/article/components/articleCard";
import { fetchArticlesByAuthor } from "@/modules/features/article/fetch/fetchArticleList";

const Pages = ({ totalPages, currentPage }: { totalPages: number; currentPage: number }) => (
  <Pagination>
    {[...Array(totalPages)].map((_, index) => {
      const page = index + 1;
      const href = `/?tab=global&page=${page}`;
      return (
        <PaginationItem href={href} active={page === currentPage} key={index}>
          {page}
        </PaginationItem>
      );
    })}
  </Pagination>
);

export const MyArticleList = async ({ username, currentPage }: { currentPage: number; username: string }) => {
  let articles: Awaited<ReturnType<typeof fetchArticlesByAuthor>>["articles"] = [];
  let articlesCount = 0;

  try {
    ({ articles, articlesCount } = await fetchArticlesByAuthor(username, currentPage));
  } catch {
    return <p>No articles found.</p>;
  }

  const totalPages = calcTotalPageNumber(articlesCount, 10);

  return articles.length < 1 ? (
    <p>No articles found.</p>
  ) : (
    <>
      {articles.map((article, index) => (
        <ArticleCard key={index} article={article} />
      ))}
      {1 < totalPages && <Pages currentPage={currentPage} totalPages={totalPages} />}
    </>
  );
};
