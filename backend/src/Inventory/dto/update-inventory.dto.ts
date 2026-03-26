import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalQuantity?: number;
}
