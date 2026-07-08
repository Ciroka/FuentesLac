import { Category } from 'src/categories';
import { RecipeDetail } from 'src/recipe-detail';
import { Supplier } from 'src/suppliers';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('supplies')
export class Supply {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ type: 'decimal', scale: 10,  precision: 2, name: 'cost_price' })
    costPrice!: number;

    @Column({ default: 0, name: 'current_stock' })
    currentStock!: number;

    @Column({ default: 0, name: 'min_stock' })
    minStock!: number;

    @Column({ name: 'supplier_id', nullable: true })
    supplierId?: number;

    @ManyToOne(() => Supplier, supplier => supplier.supplies)
    @JoinColumn({ name: 'supplier_id' })
    supplier?: Supplier;

    @Column({ name: 'category_id', nullable: true })
    categoryId?: number;
    
    @ManyToOne(() => Category, category => category.supplies, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'category_id' })
    category?: Category;

    @OneToMany(() => RecipeDetail, recipeDetails => recipeDetails.supply)
    recipeDetails!: RecipeDetail[]
}

