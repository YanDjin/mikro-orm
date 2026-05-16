import { ObjectId } from "bson";
import { PrimaryKey, SerializedPrimaryKey } from "@yandjin-mikro-orm/core";

export abstract class BaseEntity3 {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;
}
