import { IsString, IsInt, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  totalQuantity: number;
}
