import type { ArgumentsCamelCase, CommandModule } from "yargs";
import type { MikroORM } from "@yandjin-mikro-orm/core";
import type { AbstractSqlDriver } from "@yandjin-mikro-orm/knex";
import { CLIHelper } from "../CLIHelper";

export class CreateDatabaseCommand implements CommandModule {
  command = "database:create";
  describe = "Create your database if it does not exist";

  /**
   * @inheritDoc
   */
  async handler(args: ArgumentsCamelCase) {
    const orm = (await CLIHelper.getORM()) as MikroORM<AbstractSqlDriver>;

    const schemaGenerator = orm.getSchemaGenerator();
    await schemaGenerator.ensureDatabase();

    await orm.close(true);
  }
}
