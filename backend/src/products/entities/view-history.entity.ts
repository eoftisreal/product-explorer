import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ViewHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string; // Identifies the user (since we have no login)

  @CreateDateColumn()
  viewedAt: Date;

  // Link to the Product they viewed
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;
}