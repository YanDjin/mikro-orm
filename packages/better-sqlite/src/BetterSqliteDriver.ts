import type { Configuration } from "@yandjin-mikro-orm/core";
import { AbstractSqlDriver } from "@yandjin-mikro-orm/knex";
import { BetterSqliteConnection } from "./BetterSqliteConnection";
import { BetterSqlitePlatform } from "./BetterSqlitePlatform";

export class BetterSqliteDriver extends AbstractSqlDriver<BetterSqliteConnection> {
  constructor(config: Configuration) {
    super(config, new BetterSqlitePlatform(), BetterSqliteConnection, [
      "knex",
      "better-sqlite3",
    ]);
  }
}
