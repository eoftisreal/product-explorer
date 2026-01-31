// Corrected Imports
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ScrapeStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class ScrapeJob {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'https://www.worldofbooks.com/...' })
  @Column()
  targetUrl: string;

  @ApiProperty({ example: 'category' })
  @Column()
  targetType: string;

  @ApiProperty({ enum: ScrapeStatus })
  @Column({ type: 'enum', enum: ScrapeStatus, default: ScrapeStatus.PENDING })
  status: ScrapeStatus;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'text', nullable: true })
  errorLog?: string | null;

  @ApiProperty()
  @CreateDateColumn()
  startedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  finishedAt?: Date | null;
}
