import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class GraphQLPaginationInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  size?: number = 25;
}
