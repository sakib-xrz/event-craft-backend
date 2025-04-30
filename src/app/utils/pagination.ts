interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }
  
  interface PaginationResult {
    page: number;
    limit: number;
    sort: string;
    order: string;
    skip: number;
  }
  
  const calculatePagination = (options: PaginationOptions): PaginationResult => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || 'created_at';
    const order = options.order || 'desc';
  
    return {
      page,
      limit,
      sort,
      order,
      skip,
    };
  };
  
  export default calculatePagination;
  