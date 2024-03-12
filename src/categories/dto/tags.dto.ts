import { IsNotEmpty, IsString } from "class-validator";

export class AddTags {
  @IsString()
  @IsNotEmpty()
  name: string;
}
