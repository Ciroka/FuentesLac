import { ProductEntity } from "src/products/entities/product.entity";
import { AdjustmentType } from "src/shared/enums/adjustmentType.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Adjustment {

    @PrimaryGeneratedColumn()
    adjustId!: number

    @Column()
    stockChange!: number

    @Column({type: "enum", enum: AdjustmentType})
    adjustmentType!: AdjustmentType

    @Column()
    adjustmentDate!: Date

    @ManyToOne(() => ProductEntity, product => product.adjustments)
    product!: ProductEntity
}
