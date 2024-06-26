import {
  Entity,
  Enum,
  MikroORM,
  PrimaryKey,
  Property,
  Ref,
  OptionalProps,
  ManyToOne,
  OneToMany,
} from "@mikro-orm/sqlite";

jest.setTimeout(999999);

@Entity({
  tableName: "files",
  discriminatorColumn: "type",
  abstract: true,
})
export abstract class File {
  [OptionalProps]?: "type";

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Enum()
  type!: "image" | "document" | "other";
}

@Entity({ discriminatorValue: "image" })
export class Image extends File {
  @ManyToOne(() => Entity1, {
    ref: true,
  })
  relation!: Ref<Entity1>;
}

@Entity({ discriminatorValue: "document" })
export class Document extends File {
  @ManyToOne(() => Entity2, {
    ref: true,
  })
  relation!: Ref<Entity2>;
}

@Entity({ discriminatorValue: "other" })
export class Other extends File {
  @ManyToOne(() => Entity3, {
    ref: true,
  })
  relation!: Ref<Entity3>;
}

@Entity({
  tableName: "e1",
})
export abstract class Entity1 {
  [OptionalProps]?: "type";

  @PrimaryKey()
  id!: number;

  @OneToMany(() => Image, (image) => image.relation)
  image!: Ref<Image>;
}

@Entity({
  tableName: "e2",
})
export abstract class Entity2 {
  [OptionalProps]?: "type";

  @PrimaryKey()
  id!: number;

  @OneToMany(() => Document, (document) => document.relation)
  document!: Ref<Document>;
}

@Entity({
  tableName: "e3",
})
export abstract class Entity3 {
  [OptionalProps]?: "type";

  @PrimaryKey()
  id!: number;

  @OneToMany(() => Other, (other) => other.relation)
  other!: Ref<Other>;
}

describe("GH issue 0000", () => {
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init({
      entities: [File, Image, Document, Other, Entity1, Entity2, Entity3],
      dbName: ":memory:",
      debug: true,
    });
    await orm.schema.createSchema();
  });

  afterAll(() => orm.close(true));

  test("set", async () => {
    const entity1 = orm.em.create(Entity2, {
      document: orm.em.create(
        Document,
        {
          name: "name",
        },
        {
          partial: true,
        }
      ),
    });
    await orm.em.persistAndFlush(entity1);
  });

  // test("get", async () => {
  //   const collaborators = await orm.em.find(
  //     Collaborator,
  //     {
  //       active: true,
  //     },
  //     { populate: ["user"] }
  //   );
  //   expect(
  //     collaborators.map((collaborator) => collaborator.user.getEntity())
  //   ).not.toBe(undefined);
  // });
});
