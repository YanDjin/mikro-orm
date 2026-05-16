import type { EntityManager } from "@yandjin-mikro-orm/core";
import { Seeder } from "@yandjin-mikro-orm/seeder";

export class Book3Seeder extends Seeder {
  run(em: EntityManager): Promise<void> {
    return Promise.resolve(undefined);
  }
}
