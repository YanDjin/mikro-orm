import { ObjectId } from "@yandjin-mikro-orm/mongodb";
import {
  BaseEntity,
  PrimaryKey,
  SerializedPrimaryKey,
} from "@yandjin-mikro-orm/core";

export abstract class BaseEntity3 extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;
}
