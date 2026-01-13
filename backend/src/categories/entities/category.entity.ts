import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Navigation } from '../../navigation/entities/navigation.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => Navigation, (nav) => nav.categories, { onDelete: 'CASCADE' })
  navigation: Navigation;

  @CreateDateColumn()
  lastScrapedAt: Date;
}