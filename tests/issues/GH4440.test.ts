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

  @OneToMany(
    () => ManagerCollaborator,
    managerCollaborator => managerCollaborator.manager,
  )
  managerCollaborators = new Collection<ManagerCollaborator>(this);

}

@Entity({ discriminatorValue: 'employee' })
export class Employee extends User {

  @OneToMany(
    () => EmployeeCollaborator,
    employeeCollaborator => employeeCollaborator.employee,
  )
  employeeCollaborators = new Collection<EmployeeCollaborator>(this);

}

@Entity({
  tableName: 'collaborators',
  discriminatorColumn: 'type',
  abstract: true,
})
export abstract class Collaborator {

  [OptionalProps]?: 'type';

  @PrimaryKey()
  id!: number;

  @Property()
  active!: boolean;

  @Enum()
  type!: 'manager-collaborator' | 'employee-collaborator';

}

@Entity({ discriminatorValue: 'manager-collaborator' })
export class ManagerCollaborator extends Collaborator {

  @ManyToOne(() => Manager, {
    fieldName: 'collaboratorId',
    ref: true,
    index: false,
  })
  manager!: Ref<Manager>;

}

@Entity({ discriminatorValue: 'employee-collaborator' })
export class EmployeeCollaborator extends Collaborator {

  @ManyToOne(() => Employee, {
    fieldName: 'collaboratorId',
    ref: true,
    index: false,
  })
  employee!: Ref<Employee>;

}

describe('GH issue 4423', () => {
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
      dbName: ':memory:',
    });
    await orm.schema.createSchema();

    const manager = orm.em.create(Manager, {
      email: 'aaa@bbb.com',
    });
    const managerCollaborator = orm.em.create(ManagerCollaborator, {
      manager,
      active: true,
    });

    await orm.em.persistAndFlush([managerCollaborator]);
    orm.em.clear();
  });

  afterAll(() => orm.close(true));

  test('get, set and save', async () => {
    const managerCollaborator = await orm.em.findOne(
      ManagerCollaborator,
      1,
    );
    // if we delete the original data, it will work
    // @ts-ignore
    // delete managerCollaborator.__helper.__originalEntityData.employee;
    if (!managerCollaborator) {
      return;
    }
    const manager = new Manager();
    manager.email = 'bbb@aaa.com';
    manager.managerCollaborators.set([managerCollaborator]);
    await orm.em.persistAndFlush(managerCollaborator);
  });
});
