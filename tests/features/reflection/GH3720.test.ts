import { Entity, PrimaryKey, Property } from "@yandjin-mikro-orm/core";
import { MikroORM } from "@yandjin-mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@yandjin-mikro-orm/reflection";

@Entity()
export class A {
  @PrimaryKey()
  id!: number;

  @Property()
  types!: string[];
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    metadataCache: { enabled: false },
    entities: [A],
    dbName: "mikro_orm_test_3720",
    metadataProvider: TsMorphMetadataProvider,
  });

  await orm.schema.refreshDatabase();
});

afterAll(() => orm.close(true));

test("GH3720", async () => {
  await orm.em.findAndCount(A, {});
});
