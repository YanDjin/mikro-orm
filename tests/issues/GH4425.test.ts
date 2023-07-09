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
} from '@mikro-orm/sqlite';

@Entity()
class Structure {

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @OneToMany(() => Manager, manager => manager.structure)
  managers = new Collection<Manager>(this);

  @OneToMany(() => Employee, employee => employee.structure)
  employees = new Collection<Employee>(this);

}

@Entity()
class EmployeeGroup {

  @PrimaryKey()
  id!: number;

  @OneToMany(() => Employee, employee => employee.employeeGroups)
  employees = new Collection<Employee>(this);

}

@Entity({
  tableName: 'managers',
  discriminatorColumn: 'type',
  abstract: true,
})
export abstract class User {

  [OptionalProps]?: 'type';

  @PrimaryKey()
  id!: number;

  @Enum()
  type!: 'employee' | 'manager';

  @Property()
  email!: string;

}

@Entity({ discriminatorValue: 'manager' })
export class Manager extends User {

  @ManyToOne(() => Structure, {
    ref: true,
  })
  structure!: Ref<Structure>;

}

@Entity({ discriminatorValue: 'employee' })
export class Employee extends User {

  @ManyToOne(() => Structure, {
    ref: true,
  })
  structure!: Ref<Structure>;

  @ManyToOne(() => EmployeeGroup, {
    ref: true,
  })
  employeeGroups!: Ref<EmployeeGroup>;

}

describe('GH issue 4423', () => {
  let orm: MikroORM;

  beforeAll(async () => {
    orm = await MikroORM.init({
      entities: [Structure, User, Manager, Employee, EmployeeGroup],
      dbName: ':memory:',
    });
    await orm.schema.createSchema();

    const structure = orm.em.create(Structure, {
      name: 'structure',
    });

    const manager = orm.em.create(Manager, {
      email: 'aaa@bbb.com',
      structure,
    });

    await orm.em.persistAndFlush([manager]);
    orm.em.clear();
  });

  afterAll(() => orm.close(true));

  test('get, set and save', async () => {
    const manager = await orm.em.findOne(Manager, 1);
    // if we delete the original data, it will work
    // @ts-ignore
    // delete managerCollaborator.__helper.__originalEntityData.employee;
    if (!manager) { return; }
    orm.em.clear();
    const structure = new Structure();
    structure.name = 'new-structure';
    structure.managers.set([manager]);
    await orm.em.persistAndFlush(manager);
  });
});
