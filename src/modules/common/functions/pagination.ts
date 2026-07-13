export const calcTotalPageNumber = (totalItemsCount: number, itemsPerPage: number) => {
  const quotient = Math.floor(totalItemsCount / itemsPerPage);
  const remainder = totalItemsCount % itemsPerPage;

  return remainder === 0 ? quotient : quotient;
};

export const calcOffsetLimitFromPageNumber = (pageNumber: number, articlesPerPage: number) => {
  return {
    offset: (pageNumber - 1) * articlesPerPage,
    limit: articlesPerPage,
  };
};
