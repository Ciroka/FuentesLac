import { Recipe } from 'src/recipe/entities/recipe.entity';
import { Supply } from 'src/supplies';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recipe_details')
export class RecipeDetail {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    quantity!: number;

    @ManyToOne(() => Recipe, recipe => recipe.details)
    recipe!: Recipe;

    @ManyToOne(() => Supply, supply => supply.recipeDetails, { onDelete: 'RESTRICT' })
    supply!: Supply;
} 
