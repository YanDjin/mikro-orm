import { Seeder } from "@yandjin-mikro-orm/seeder";
import type { Dictionary, EntityManager } from "@yandjin-mikro-orm/core";
import { Project } from "../../features/seeder/entities/project.entity";

export class ProjectSeeder extends Seeder {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    em.create(
      Project,
      {
        name: "Construction",
        owner: context.user,
        worth: 313,
      },
      { persist: true },
    );
  }
}
