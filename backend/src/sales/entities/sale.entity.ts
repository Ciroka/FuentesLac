import { Client } from "src/clients/entities/client.entity";
import { SalesDetail } from "src/sales-detail/entities/sales-detail.entity";
import { PaymentMethod } from "src/shared/enums/paymentMethod..enum";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sale {

    @PrimaryGeneratedColumn()
    saleId!: number

    @Column()
    saleDate!: Date

    @Column()
    total!: number

    @Column({type: "enum", enum: PaymentMethod})
    paymentMethod!: PaymentMethod

    @OneToMany(() => SalesDetail, salesDetails => salesDetails.sale)
    salesDetails!: SalesDetail[]

    @ManyToOne(() => Client, client => client.sales, {nullable: true})
    client!: Client
}
