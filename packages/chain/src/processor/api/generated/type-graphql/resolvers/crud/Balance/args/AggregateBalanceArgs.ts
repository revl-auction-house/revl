import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { BalanceOrderByWithRelationInput } from "../../../inputs/BalanceOrderByWithRelationInput";
import { BalanceWhereInput } from "../../../inputs/BalanceWhereInput";
import { BalanceWhereUniqueInput } from "../../../inputs/BalanceWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateBalanceArgs {
  @TypeGraphQL.Field(_type => BalanceWhereInput, {
    nullable: true
  })
  where?: BalanceWhereInput | undefined;

  @TypeGraphQL.Field(_type => [BalanceOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: BalanceOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => BalanceWhereUniqueInput, {
    nullable: true
  })
  cursor?: BalanceWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
