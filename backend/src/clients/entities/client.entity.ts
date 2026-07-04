import { Sale } from "src/sales/entities/sale.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Client {

    @PrimaryGeneratedColumn()
    clientId!: number;

    @Column()
    name!: string

    @Column()
    lastName!: string

    @Column()
    phone!: string

    @Column()
    cuit!: string

    @Column()
    email!: string

    @OneToMany(() => Sale, sales => sales.client)
    sales!: Sale[]
}
