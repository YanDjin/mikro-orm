import { Configuration } from '@mikro-orm/core';
import { DatabaseTable } from './DatabaseTable';
import { SchemaHelper } from './SchemaHelper';
import { AbstractSqlConnection } from '../AbstractSqlConnection';
import { Table } from '../typings';

export class DatabaseSchema {

  private readonly tables: DatabaseTable[] = [];

  addTable(name: string, schema: string | undefined | null): DatabaseTable {
    const table = new DatabaseTable(name, schema ?? undefined);
    this.tables.push(table);

    return table;
  }

  getTables(): DatabaseTable[] {
    return this.tables;
  }

  getTable(name: string): DatabaseTable | undefined {
    return this.tables.find(t => t.name === name || `${t.schema}.${t.name}` === name);
  }

  static async create(connection: AbstractSqlConnection, helper: SchemaHelper, config: Configuration) {
    const schema = new DatabaseSchema();
    const tables = await connection.execute<Table[]>(helper.getListTablesSQL());

    for (const t of tables) {
      if (t.table_name === config.get('migrations').tableName!) {
        continue;
      }

      const table = schema.addTable(t.table_name, t.schema_name);
      const cols = await helper.getColumns(connection, table.name, table.schema);
      const indexes = await helper.getIndexes(connection, table.name, table.schema);
      const pks = await helper.getPrimaryKeys(connection, indexes, table.name, table.schema);
      const fks = await helper.getForeignKeys(connection, table.name, table.schema);
      const enums = await helper.getEnumDefinitions(connection, table.name, table.schema);
      table.init(cols, indexes, pks, fks, enums);
    }

    return schema;
  }

}
