import { Order } from "src/orders/entities/order.entity";
import { ProductEntity } from "src/products/entities/product.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OrdersDetail {

    @PrimaryGeneratedColumn()
    ordersDetailId!: number

    @Column()
    quantity!: number

    @Column({type: "decimal", precision: 10, scale: 2})
    subtotal!: number

    @ManyToOne(() => Order, order => order.ordersDetails)
    order!: Order

    @ManyToOne(() => ProductEntity, product => product.ordersDetails)
    product!: ProductEntity
}
