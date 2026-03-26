import "dotenv/config";
import { PrismaClient, CustomFieldType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Enum option color mapping ──────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  "green": "#10B981",
  "red": "#EF4444",
  "orange": "#F97316",
  "purple": "#8B5CF6",
  "yellow-orange": "#F59E0B",
  "aqua": "#06B6D4",
  "yellow-green": "#84CC16",
  "magenta": "#EC4899",
  "blue": "#3B82F6",
  "none": "#6B7280",
  "blue-green": "#14B8A6",
};

function hexColor(asanaColor: string): string {
  return COLOR_MAP[asanaColor] || "#6B7280";
}

async function main() {
  // ─── Find workspace & project ─────────────────────────────────────────────
  const workspace = await prisma.workspace.findFirst({ where: { slug: "calirom" } });
  if (!workspace) throw new Error("Workspace 'calirom' not found. Run seed first.");

  const project = await prisma.project.findFirst({ where: { name: "Calirom General" } });
  if (!project) throw new Error("Project 'Calirom General' not found. Run seed first.");

  const userPE = await prisma.user.findFirst({ where: { email: "pe@calirom.ro" } });
  if (!userPE) throw new Error("User pe@calirom.ro not found. Run seed first.");

  console.log(`✓ Found project: ${project.name} (${project.id})`);

  // ─── Delete existing demo jobs ────────────────────────────────────────────
  const deleted = await prisma.job.deleteMany({ where: { projectId: project.id } });
  console.log(`✓ Deleted ${deleted.count} existing demo jobs`);

  // ─── Delete & recreate custom field definitions ───────────────────────────
  await prisma.customFieldDefinition.deleteMany({ where: { projectId: project.id } });
  console.log("✓ Cleared existing custom field definitions");

  // ─── Create sections ──────────────────────────────────────────────────────
  await prisma.section.deleteMany({ where: { projectId: project.id } });

  const sectionDeProdu = await prisma.section.create({
    data: { projectId: project.id, name: "De produs", position: 0 },
  });
  const sectionDeRefacut = await prisma.section.create({
    data: { projectId: project.id, name: "De refacut", position: 1 },
  });

  const sectionMap: Record<string, string> = {
    "1200517353076112": sectionDeProdu.id,
    "1200552962871919": sectionDeRefacut.id,
  };
  console.log("✓ Created sections: De produs, De refacut");

  // ─── Create custom field definitions ─────────────────────────────────────
  // Client (text)
  const cfClient = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Client", fieldType: CustomFieldType.TEXT, position: 0 },
  });

  // facturat / calculat (enum)
  const cfFacturat = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "facturat / calculat", fieldType: CustomFieldType.ENUM, position: 1 },
  });
  const facturatOptions = [
    { name: "Da", color: hexColor("green"), position: 0 },
    { name: "Nu", color: hexColor("red"), position: 1 },
    { name: "Asteapta decizie", color: hexColor("orange"), position: 2 },
  ];
  for (const opt of facturatOptions) {
    await prisma.enumOption.create({ data: { fieldDefinitionId: cfFacturat.id, ...opt } });
  }

  // Priority (enum)
  const cfPriority = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Priority", fieldType: CustomFieldType.ENUM, position: 2 },
  });
  const priorityOptions = [
    { name: "RESPECT!", color: hexColor("red"), position: 0 },
    { name: "High", color: hexColor("purple"), position: 1 },
    { name: "Medium", color: hexColor("yellow-orange"), position: 2 },
    { name: "Low", color: hexColor("aqua"), position: 3 },
  ];
  for (const opt of priorityOptions) {
    await prisma.enumOption.create({ data: { fieldDefinitionId: cfPriority.id, ...opt } });
  }

  // Status (enum)
  const cfStatus = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Status", fieldType: CustomFieldType.ENUM, position: 3 },
  });
  const statusOptions = [
    { name: "Pregatita", color: hexColor("yellow-green"), position: 0 },
    { name: "Asteapta decizie / aprobare", color: hexColor("orange"), position: 1 },
    { name: "Probleme", color: hexColor("yellow-orange"), position: 2 },
    { name: "Asteapta material", color: hexColor("aqua"), position: 3 },
    { name: "asteapta grafica", color: hexColor("blue"), position: 4 },
    { name: "In lucru", color: hexColor("magenta"), position: 5 },
    { name: "DTP", color: hexColor("red"), position: 6 },
    { name: "Terminat", color: hexColor("none"), position: 7 },
  ];
  for (const opt of statusOptions) {
    await prisma.enumOption.create({ data: { fieldDefinitionId: cfStatus.id, ...opt } });
  }

  // Grafica (enum)
  const cfGrafica = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Grafica", fieldType: CustomFieldType.ENUM, position: 4 },
  });
  const graficaOptions = [
    { name: "Da", color: hexColor("green"), position: 0 },
    { name: "Nu", color: hexColor("red"), position: 1 },
    { name: "Grafica cu probleme", color: hexColor("orange"), position: 2 },
  ];
  for (const opt of graficaOptions) {
    await prisma.enumOption.create({ data: { fieldDefinitionId: cfGrafica.id, ...opt } });
  }

  // Material (text)
  const cfMaterial = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Material", fieldType: CustomFieldType.TEXT, position: 5 },
  });

  // Debitat si pregatit (enum)
  const cfDebitat = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Debitat si pregatit", fieldType: CustomFieldType.ENUM, position: 6 },
  });
  const debitatOptions = [
    { name: "NU TREBUIE", color: hexColor("blue-green"), position: 0 },
    { name: "DA", color: hexColor("yellow-green"), position: 1 },
    { name: "NU", color: hexColor("red"), position: 2 },
  ];
  for (const opt of debitatOptions) {
    await prisma.enumOption.create({ data: { fieldDefinitionId: cfDebitat.id, ...opt } });
  }

  // Numar de bucati (number)
  const cfBucati = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Numar de bucati", fieldType: CustomFieldType.NUMBER, position: 7 },
  });

  // Link grafica (url)
  const cfLinkGrafica = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Link grafica", fieldType: CustomFieldType.URL, position: 8 },
  });

  // Link comanda (url)
  const cfLinkComanda = await prisma.customFieldDefinition.create({
    data: { projectId: project.id, name: "Link comanda", fieldType: CustomFieldType.URL, position: 9 },
  });

  console.log("✓ Created 10 custom field definitions with correct enum options");

  // ─── Build enum option lookup maps ────────────────────────────────────────
  async function buildEnumMap(fieldId: string): Promise<Map<string, string>> {
    const options = await prisma.enumOption.findMany({ where: { fieldDefinitionId: fieldId } });
    return new Map(options.map((o) => [o.name, o.id]));
  }

  const facturatMap = await buildEnumMap(cfFacturat.id);
  const priorityMap = await buildEnumMap(cfPriority.id);
  const statusMap = await buildEnumMap(cfStatus.id);
  const graficaMap = await buildEnumMap(cfGrafica.id);
  const debitatMap = await buildEnumMap(cfDebitat.id);

  // ─── Load import data ──────────────────────────────────────────────────────
  const importData = JSON.parse(
    fs.readFileSync("/tmp/asana_import_data.json", "utf-8")
  ) as Array<{
    asana_gid: string;
    name: string;
    completed: boolean;
    due_on: string | null;
    assignee: string | null;
    section_gid: string | null;
    position: number;
    custom_fields: Record<string, { type: string; value: unknown }>;
  }>;

  console.log(`\n→ Importing ${importData.length} tasks...`);

  let imported = 0;
  let errors = 0;

  for (const task of importData) {
    try {
      const sectionId = task.section_gid ? sectionMap[task.section_gid] || sectionDeProdu.id : sectionDeProdu.id;

      const job = await prisma.job.create({
        data: {
          projectId: project.id,
          sectionId,
          name: task.name,
          isCompleted: task.completed,
          completedAt: task.completed ? new Date() : null,
          dueDate: task.due_on ? new Date(task.due_on) : null,
          position: task.position,
          createdById: userPE.id,
        },
      });

      // Assignee
      if (task.assignee) {
        await prisma.jobAssignee.create({
          data: { jobId: job.id, userId: userPE.id },
        });
      }

      // Custom field values
      const cfValues: Array<{ jobId: string; fieldDefinitionId: string; textValue?: string | null; numberValue?: number | null; enumOptionId?: string | null }> = [];

      const getEnum = (map: Map<string, string>, value: unknown) =>
        typeof value === "string" ? (map.get(value) ?? null) : null;

      const cfs = task.custom_fields;

      if (cfs["Client"]?.value) {
        cfValues.push({ jobId: job.id, fieldDefinitionId: cfClient.id, textValue: String(cfs["Client"].value) });
      }
      if (cfs["facturat / calculat"]?.value) {
        const eid = getEnum(facturatMap, cfs["facturat / calculat"].value);
        if (eid) cfValues.push({ jobId: job.id, fieldDefinitionId: cfFacturat.id, enumOptionId: eid });
      }
      if (cfs["Priority"]?.value) {
        const eid = getEnum(priorityMap, cfs["Priority"].value);
        if (eid) cfValues.push({ jobId: job.id, fieldDefinitionId: cfPriority.id, enumOptionId: eid });
      }
      if (cfs["Status"]?.value) {
        const eid = getEnum(statusMap, cfs["Status"].value);
        if (eid) cfValues.push({ jobId: job.id, fieldDefinitionId: cfStatus.id, enumOptionId: eid });
      }
      if (cfs["Grafica"]?.value) {
        const eid = getEnum(graficaMap, cfs["Grafica"].value);
        if (eid) cfValues.push({ jobId: job.id, fieldDefinitionId: cfGrafica.id, enumOptionId: eid });
      }
      if (cfs["Material"]?.value) {
        cfValues.push({ jobId: job.id, fieldDefinitionId: cfMaterial.id, textValue: String(cfs["Material"].value) });
      }
      if (cfs["Debitat si pregatit"]?.value) {
        const eid = getEnum(debitatMap, cfs["Debitat si pregatit"].value);
        if (eid) cfValues.push({ jobId: job.id, fieldDefinitionId: cfDebitat.id, enumOptionId: eid });
      }
      if (cfs["Numar de bucati"]?.value != null) {
        cfValues.push({ jobId: job.id, fieldDefinitionId: cfBucati.id, numberValue: Number(cfs["Numar de bucati"].value) });
      }
      if (cfs["Link grafica"]?.value) {
        cfValues.push({ jobId: job.id, fieldDefinitionId: cfLinkGrafica.id, textValue: String(cfs["Link grafica"].value) });
      }
      if (cfs["Link comanda"]?.value) {
        cfValues.push({ jobId: job.id, fieldDefinitionId: cfLinkComanda.id, textValue: String(cfs["Link comanda"].value) });
      }

      if (cfValues.length > 0) {
        await prisma.jobCustomFieldValue.createMany({ data: cfValues });
      }

      imported++;
      if (imported % 50 === 0) console.log(`  → ${imported}/${importData.length} imported...`);
    } catch (err) {
      console.error(`  ✗ Error on "${task.name}":`, err);
      errors++;
    }
  }

  console.log(`\n✅ Import complet!`);
  console.log(`   Imported: ${imported} tasks`);
  console.log(`   Errors:   ${errors}`);
  console.log(`   Sections: De produs, De refacut`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
