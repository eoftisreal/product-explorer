import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
  @ApiProperty({ example: 1, description: 'Internal database ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'The Great Gatsby', description: 'Book Title' })
  @Column()
  title: string;

  @ApiProperty({ example: 'F. Scott Fitzgerald', required: false })
  @Column({ nullable: true })
  author: string;

  @ApiProperty({ example: 'A story of wealth and love...', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: '£7.99' })
  @Column()
  price: string;

  @ApiProperty({ example: 'https://image-server.../123.jpg' })
  @Column()
  image: string;

  @ApiProperty({ example: 4.5, required: false })
  @Column('float', { nullable: true })
  rating: number;

  @ApiProperty({ example: 'Fiction' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ example: '9780141182636', uniqueItems: true })
  @Column({ unique: true })
  sourceId: string;

  @ApiProperty({ example: 'https://worldofbooks.com/...' })
  @Column()
  sourceUrl: string;

  @ApiProperty()
  @UpdateDateColumn()
  lastScrapedAt: Date;
}