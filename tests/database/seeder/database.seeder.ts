import { Seeder } from "@yandjin-mikro-orm/seeder";
import type { EntityManager } from "@yandjin-mikro-orm/core";
import { ProjectSeeder } from "./project.seeder";
import { UserSeeder } from "./user.seeder";

export class DatabaseSeeder extends Seeder {
  run(em: EntityManager): Promise<void> {
    return this.call(em, [UserSeeder, ProjectSeeder]);
  }
}
