import { IsString, IsInt, IsUUID, Min } from 'class-validator';

export class ReserveDto {
  @IsUUID()
  inventoryId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class ConfirmDto {
  @IsUUID()
  reservationId: string;
}

export class CancelDto {
  @IsUUID()
  reservationId: string;
}

export class ExtendDto {
  @IsUUID()
  reservationId: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;
}
