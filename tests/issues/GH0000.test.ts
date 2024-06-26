import {
  Collection,
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
  tableName: "users",
  discriminatorColumn: "type",
  abstract: true,
})
export abstract class User {
  [OptionalProps]?: "type";

  @PrimaryKey()
  id!: number;

  @Enum()
  type!: "employee" | "manager";

  @Property()
  email!: string;

  @OneToMany(
    () => Collaborator,
    (employeeCollaborator) => employeeCollaborator.user
  )
  collaborators = new Collection<Collaborator>(this);
}

@Entity({ discriminatorValue: "manager" })
export class Manager extends User {
  @OneToMany(
    () => ManagerCollaborator,
    (managerCollaborator) => managerCollaborator.user
  )
  managerCollaborators = new Collection<ManagerCollaborator>(this);
}

@Entity({ discriminatorValue: "employee" })
export class Employee extends User {
  @OneToMany(
    () => EmployeeCollaborator,
    (employeeCollaborator) => employeeCollaborator.user
  )
  employeeCollaborators = new Collection<EmployeeCollaborator>(this);
}

@Entity({
  tableName: "collaborators",
  discriminatorColumn: "type",
  abstract: true,
})
export abstract class Collaborator {
  [OptionalProps]?: "type";

  @PrimaryKey()
  id!: number;

  @Property()
  active!: boolean;

  @Enum()
  type!: "manager-collaborator" | "employee-collaborator";

  @ManyToOne(() => User, {
    fieldName: "userId",
    ref: true,
    index: false,
  })
  user!: Ref<User>;
}

@Entity({ discriminatorValue: "manager-collaborator" })
export class ManagerCollaborator extends Collaborator {
  @ManyToOne(() => Manager, {
    fieldName: "userId",
    ref: true,
    index: false,
  })
  declare user: Ref<Manager>;
}

@Entity({ discriminatorValue: "employee-collaborator" })
export class EmployeeCollaborator extends Collaborator {
  @ManyToOne(() => Employee, {
    fieldName: "userId",
    ref: true,
    index: false,
  })
  declare user: Ref<Employee>;
}

describe("GH issue 0000", () => {
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init({
      entities: [
        User,
        Manager,
        Employee,
        Collaborator,
        ManagerCollaborator,
        EmployeeCollaborator,
      ],
      dbName: ":memory:",
      debug: true,
    });
    await orm.schema.createSchema();

    const manager = orm.em.create(Manager, {
      email: "aaa@bbb.com",
    });
    const managerCollaborator = orm.em.create(ManagerCollaborator, {
      user: manager,
      active: true,
    });

    const employee = orm.em.create(Employee, {
      email: "aaa@bbb.com",
    });
    const employeeCollaborator = orm.em.create(EmployeeCollaborator, {
      user: employee,
      active: true,
    });

    await orm.em.persistAndFlush([managerCollaborator, employeeCollaborator]);
    orm.em.clear();
  });

  afterAll(() => orm.close(true));

  test("get length", async () => {
    const collaborators = await orm.em.find(Collaborator, {
      active: true,
    });
    expect(collaborators.length).toBe(2);
  });

  test("get", async () => {
    const collaborators = await orm.em.find(
      Collaborator,
      {
        active: true,
      },
      { populate: ["user"] }
    );
    expect(
      collaborators.map((collaborator) => collaborator.user.getEntity())
    ).not.toBe(undefined);
  });
});
