import { OrdersDetail } from "src/orders-detail/entities/orders-detail.entity";
import { Supplier } from "src/suppliers/entities/supplier.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    orderId!: number

    @Column()
    orderDate!: Date

    @Column()
    total!: number

    @OneToMany(() => OrdersDetail, ordersDetails => ordersDetails.order)
    ordersDetails!: OrdersDetail[]

    @ManyToOne(() => Supplier, supplier => supplier.orders)
    supplier!: Supplier
}
