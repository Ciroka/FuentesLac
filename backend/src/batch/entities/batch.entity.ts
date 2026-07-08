import { Product } from "src/products";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('batch')
export class Batch {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    yield?: number

    @Column({ nullable: true })
    description?: string;

    @OneToMany(() => Product, products => products.batch)
    products!: Product[];
}
