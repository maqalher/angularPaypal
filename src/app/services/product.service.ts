import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  products: Product[] = [
    new Product(1,'FIFA 22', 'lorem ipsum', 521, 'https://m.media-amazon.com/images/I/817dIPZKz9L._AC_SL1500_.jpg'),
    new Product(2,'Gran Turismo 7', 'lorem ipsum', 1619, 'https://m.media-amazon.com/images/I/81GCYk07VSL._AC_SX679_.jpg'),
    new Product(3,'Ghost of Tsushima', 'lorem ipsum', 1471, 'https://m.media-amazon.com/images/I/81LmR4liNaL._AC_SL1500_.jpg'),
    new Product(4,'WWE 2K22 ', 'lorem ipsum', 1295, 'https://m.media-amazon.com/images/I/81a7W5dr1xL._AC_SL1500_.jpg'),
    new Product(5,'Death Stranding', 'lorem ipsum', 699, 'https://m.media-amazon.com/images/I/819XulxbTLL._AC_SL1500_.jpg'),
    new Product(6,'Elden Ring', 'lorem ipsum', 1079, 'https://m.media-amazon.com/images/I/6161slXZUTL._AC_SL1000_.jpg'),
  ];

  constructor() { }

  getProducts():Product[]{
    return this.products;
  }


}
