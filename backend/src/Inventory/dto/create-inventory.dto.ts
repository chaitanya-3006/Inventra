import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  totalQuantity: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
