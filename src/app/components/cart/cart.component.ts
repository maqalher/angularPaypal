import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { Product } from '../../models/product';
import { CartItemModel } from '../../models/cart-item-model';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { environment } from 'src/environments/environment';
import { StorageService } from '../../services/storage.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartItems: CartItemModel[] = [];
  total: number = 0;

  public payPalConfig?: IPayPalConfig;

  constructor(
    private messageService: MessageService,
    private storageService: StorageService,
    private modalService:NgbModal,
    private spinner:NgxSpinnerService
  ) { }



  getItem(): void {
    this.messageService.getMessage().subscribe((product: Product) => {
      let exist = false;
      this.cartItems.forEach(item => {
        if (item.productId === product.id) {
          exist = true;
          item.qty++
        }
      });
      if (!exist) {
        const cartItem = new CartItemModel(product);
        this.cartItems.push(cartItem);
      }
      this.total = this.getTotal();
      this.storageService.setCart(this.cartItems);
    });
  }

  getItemsList(): any[] {
    // trasforma cartItems en product de la forma de paypal
    const items: any[] = [];
    let item = {};
    this.cartItems.forEach((it: CartItemModel) => {
      item = {
        name: it.productName,
        quantity: it.qty,
        unit_amount: {
          currency_code: 'MXN',
          value: it.productPrice,
        }
      }
      items.push(item);
    });
    return items;
  }

  getTotal(): number {
    let total = 0;
    this.cartItems.forEach(item => {
      total += item.qty * item.productPrice;
    });
    return +total.toFixed(2);
  }

  emptyCart(): void {
    this.cartItems = [];
    this.total = 0;
    this.storageService.clear();
  }

  deleteItem(i: number): void {
    if (this.cartItems[i].qty > 1) {
      this.cartItems[i].qty--;
    } else {
      this.cartItems.splice(i, 1);
    }
    this.total = this.getTotal();
    this.storageService.setCart(this.cartItems);
  }

  ngOnInit(): void {
    let p = this.getItemsList();
    console.log(p)

    this.initConfig();

    if (this.storageService.existCart()) {
      this.cartItems = this.storageService.getCart();
    }

    this.getItem();

  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'MXN',
      clientId: environment.clientId, // Client ID Paypal
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'MXN',
            // value: '9.99',
            value: this.getTotal().toString(), // add total
            breakdown: {
              item_total: {
                currency_code: 'MXN',
                // value: '9.99'
                value: this.getTotal().toString(), // add total
              }
            }
          },
          items: this.getItemsList()
            // [
            //   {
            //     name: 'Enterprise Subscription',
            //     quantity: '1',
            //     category: 'DIGITAL_GOODS',
            //     unit_amount: {
            //       currency_code: 'EUR',
            //       value: '9.99',
            //     },
            //   }
            // ]
        }]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {

        // mostrar spinner
        this.spinner.show();

        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          // console.log('onApprove - you can get full order details inside onApprove: ', details);
          console.log('onApprove - you can get full order details inside onApprove: ', JSON.stringify(details));
        });

      },
      onClientAuthorization: (data) => {
        // console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', JSON.stringify(data) );
        // this.showSuccess = true;
        this.openModal(
          data.purchase_units[0].items,
          data.purchase_units[0].amount.value
        );
        this.emptyCart();

        // cerrar spiner
        this.spinner.hide();
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
        // this.showCancel = true;

      },
      onError: err => {
        console.log('OnError', err);
        // this.showError = true;
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
        // this.resetStatus();
      }
    };
  }

  openModal(items:any, amount:string):void {
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.items = items;
    modalRef.componentInstance.amount = amount;
  }

}
