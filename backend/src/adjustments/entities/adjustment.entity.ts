import { Product } from 'src/products/entities/product.entity';
import { AdjustmentType } from 'src/shared/enums/adjustmentType.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Adjustment {
  @PrimaryGeneratedColumn()
  adjustId!: number;

  @Column()
  stockChange!: number;

  @Column({ type: 'enum', enum: AdjustmentType })
  adjustmentType!: AdjustmentType;

  @Column()
  adjustmentDate!: Date;

  @ManyToOne(() => Product, (product) => product.adjustments)
  product!: Product;
}
