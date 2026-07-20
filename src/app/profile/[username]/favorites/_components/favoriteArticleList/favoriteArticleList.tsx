import { Pagination, PaginationItem } from "@/modules/common/components/pagination";
import { calcTotalPageNumber } from "@/modules/common/functions/pagination";
import { ArticleCard } from "@/modules/features/article/components/articleCard";
import { fetchFavoriteArticles } from "@/modules/features/article/fetch/fetchArticleList";

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

export const FavoriteArticleList = async ({ username, currentPage }: { currentPage: number; username: string }) => {
  let articles: Awaited<ReturnType<typeof fetchFavoriteArticles>>["articles"] = [];
  let articlesCount = 0;

  try {
    ({ articles, articlesCount } = await fetchFavoriteArticles(username, currentPage));
  } catch (error) {
    // Degrade gracefully: a failed favorites fetch must not crash the whole page
    // (which would tear down the profile layout/user-info via the root error boundary).
    console.error("Failed to load favorite articles:", error);
    return <p>Unable to load articles. Please try again later.</p>;
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
