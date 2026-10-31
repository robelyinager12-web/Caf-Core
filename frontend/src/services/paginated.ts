export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    totalPages?: number;
  };
}

export async function getAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedResponse<T>>
): Promise<T[]> {
  const limit = 100;
  const firstPage = await fetchPage(1, limit);
  const totalPages = firstPage.meta?.totalPages;

  if (
    !Array.isArray(firstPage.data) ||
    typeof totalPages !== 'number' ||
    !Number.isInteger(totalPages) ||
    totalPages < 0
  ) {
    throw new Error('The server returned an invalid paginated response.');
  }

  const results = [...firstPage.data];
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await fetchPage(page, limit);
    if (!Array.isArray(response.data)) {
      throw new Error('The server returned an invalid paginated response.');
    }
    results.push(...response.data);
  }

  return results;
}
