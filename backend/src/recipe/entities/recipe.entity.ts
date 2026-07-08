import { RecipeDetail } from 'src/recipe-detail';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recipes')
export class Recipe {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    description?: string;

    @OneToMany(() => RecipeDetail, details => details.recipe)
    details!: RecipeDetail[];
}
