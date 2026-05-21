export type Category = {
  id: number;
  name: string;
  description: string;
  active: boolean;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  active: boolean;
  primaryImageUrl?: string | null;
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  primaryImage: boolean;
  productId: number;
};

export type ProductPageResponse = {
  timestamp: string;
  status: number;
  message: string;
  data: {
    content: Product[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  };
};

export type CategoryListResponse = {
  timestamp: string;
  status: number;
  message: string;
  data: Category[];
};

export type ProductImageListResponse = {
  timestamp: string;
  status: number;
  message: string;
  data: ProductImage[];
};