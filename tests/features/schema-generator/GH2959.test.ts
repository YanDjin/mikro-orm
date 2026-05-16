import {
  Entity,
  ManyToOne,
  MikroORM,
  PrimaryKey,
} from "@yandjin-mikro-orm/core";
import { SqliteDriver } from "@yandjin-mikro-orm/sqlite";

@Entity()
export class Foo {
  @PrimaryKey()
  id!: number;

  @PrimaryKey()
  something?: number;
}

@Entity()
export class Bar {
  @ManyToOne()
  foo!: Foo;

  @PrimaryKey()
  id!: number;
}

test("GH issue 2959", async () => {
  const orm = await MikroORM.init({
    dbName: ":memory:",
    driver: SqliteDriver,
    entities: [Foo, Bar],
  });
  await orm.schema.updateSchema();
  await orm.schema.updateSchema();
  await orm.close();
});
