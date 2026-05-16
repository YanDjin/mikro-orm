import { Seeder } from "@yandjin-mikro-orm/seeder";
import type { EntityManager } from "@yandjin-mikro-orm/core";

export class Author3Seeder extends Seeder {
  run(em: EntityManager): Promise<void> {
    return Promise.resolve(undefined);
  }
}
