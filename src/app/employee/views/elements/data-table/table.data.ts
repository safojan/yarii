export interface IProduct {
  id: number;
  name: string;
  color: string;
  category: string;
  price: number;
  location: string;
}

export interface IColumn {
  field: string;
  headerName: string;
  width?: number;
  isEditable?: boolean;
  isSortable?: boolean;
  type?: string | number | boolean;
}

export class TableData {
  public static readonly products: IProduct[] = [
    {
      id: 1,
      name: 'Apple MacBook Pro 17"',
      color: 'Silver',
      category: 'Laptop',
      price: 29999,
      location: 'Karachi',
    },
    {
      id: 2,
      name: 'Microsoft Surface Pro',
      color: 'White',
      category: 'Laptop PC',
      price: 1999,
      location: 'Karachi',
    },
    {
      id: 3,
      name: 'Magic Mouse 2',
      color: 'Black',
      category: 'Accessories',
      price: 99,
      location: 'Karachi',
    },
    {
      id: 4,
      name: 'Apple Watch',
      color: 'Black',
      category: 'Watches',
      price: 199,
      location: 'Karachi',
    },
    {
      id: 5,
      name: 'Apple iMac',
      color: 'Silver',
      category: 'PC',
      price: 199,
      location: 'Karachi',
    },
    {
      id: 6,
      name: 'Apple AirPods',
      color: 'White',
      category: 'Accessories',
      price: 399,
      location: 'Karachi',
    },
    {
      id: 7,
      name: 'iPad Pro',
      color: 'Gold',
      category: 'Tablet',
      price: 699,
      location: 'Karachi',
    },
    {
      id: 8,
      name: 'Magic Keyboard',
      color: 'Black',
      category: 'Accessories',
      price: 99,
      location: 'Karachi',
    },
    {
      id: 9,
      name: 'Smart Folio iPad Air',
      color: 'Blue',
      category: 'Accessories',
      price: 79,
      location: 'Karachi',
    },
    {
      id: 10,
      name: 'AirTag',
      color: 'Silver',
      category: 'Accessories',
      price: 29,
      location: 'Karachi',
    },
    {
      id: 7,
      name: 'iPad Pro',
      color: 'Gold',
      category: 'Tablet',
      price: 699,
      location: 'Karachi',
    },
    {
      id: 8,
      name: 'Magic Keyboard',
      color: 'Black',
      category: 'Accessories',
      price: 99,
      location: 'Karachi',
    },
    {
      id: 9,
      name: 'Smart Folio iPad Air',
      color: 'Blue',
      category: 'Accessories',
      price: 79,
      location: 'Karachi',
    },
    {
      id: 10,
      name: 'AirTag',
      color: 'Silver',
      category: 'Accessories',
      price: 29,
      location: 'Karachi',
    },
  ];
  public static readonly columnData: IColumn[] = [
    {
      field: 'productname',
      headerName: 'product name',
      width: 25,
      isEditable: true,
      isSortable: false,
    },
    {
      field: 'color',
      headerName: 'Color',
      width: 25,
      isEditable: true,
      isSortable: false,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 25,
      isEditable: true,
      isSortable: false,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 25,
      isEditable: true,
      isSortable: false,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 25,
      isEditable: true,
      isSortable: false,
    },
  ];

  public static readonly pageNumber: number[] = [1, 2, 3, 4, 5];
}
