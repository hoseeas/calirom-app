import "dotenv/config";
import { PrismaClient, CustomFieldType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "calirom" },
    update: {},
    create: {
      name: "Calirom General",
      slug: "calirom",
    },
  });

  // Users
  const userPE = await prisma.user.upsert({
    where: { email: "pe@calirom.ro" },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "ProPrint Admin",
      email: "pe@calirom.ro",
      password: await bcrypt.hash("calirom2024", 10),
      initials: "PE",
      avatarColor: "#E879F9",
      role: "OWNER",
    },
  });

  const userMS = await prisma.user.upsert({
    where: { email: "ms@calirom.ro" },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "Echipa Print",
      email: "ms@calirom.ro",
      password: await bcrypt.hash("calirom2024", 10),
      initials: "ms",
      avatarColor: "#34D399",
      role: "MEMBER",
    },
  });

  // Proiect: Calirom General
  const project = await prisma.project.upsert({
    where: { id: "project-calirom" },
    update: {},
    create: {
      id: "project-calirom",
      workspaceId: workspace.id,
      name: "Calirom General",
      color: "#6B7280",
      isStarred: true,
      position: 0,
      createdById: userPE.id,
    },
  });

  // Membrii
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: userPE.id } },
    update: {},
    create: { projectId: project.id, userId: userPE.id, role: "owner" },
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: userMS.id } },
    update: {},
    create: { projectId: project.id, userId: userMS.id, role: "member" },
  });

  // Custom Fields
  const cfClient = await prisma.customFieldDefinition.upsert({
    where: { id: "cf-client" },
    update: {},
    create: { id: "cf-client", projectId: project.id, name: "Client", fieldType: CustomFieldType.TEXT, position: 0 },
  });

  const cfPriority = await prisma.customFieldDefinition.upsert({
    where: { id: "cf-priority" },
    update: {},
    create: { id: "cf-priority", projectId: project.id, name: "Priority", fieldType: CustomFieldType.ENUM, position: 1 },
  });
  await prisma.enumOption.upsert({ where: { id: "opt-high" }, update: {}, create: { id: "opt-high", fieldDefinitionId: cfPriority.id, name: "High", color: "#F43F5E", position: 0 } });
  await prisma.enumOption.upsert({ where: { id: "opt-medium" }, update: {}, create: { id: "opt-medium", fieldDefinitionId: cfPriority.id, name: "Medium", color: "#F59E0B", position: 1 } });
  await prisma.enumOption.upsert({ where: { id: "opt-low" }, update: {}, create: { id: "opt-low", fieldDefinitionId: cfPriority.id, name: "Low", color: "#10B981", position: 2 } });

  const cfFacturat = await prisma.customFieldDefinition.upsert({
    where: { id: "cf-facturat" },
    update: {},
    create: { id: "cf-facturat", projectId: project.id, name: "Facturat / Calculat", fieldType: CustomFieldType.ENUM, position: 2 },
  });
  await prisma.enumOption.upsert({ where: { id: "opt-facturat" }, update: {}, create: { id: "opt-facturat", fieldDefinitionId: cfFacturat.id, name: "Facturat", color: "#10B981", position: 0 } });
  await prisma.enumOption.upsert({ where: { id: "opt-calculat" }, update: {}, create: { id: "opt-calculat", fieldDefinitionId: cfFacturat.id, name: "Calculat", color: "#F59E0B", position: 1 } });
  await prisma.enumOption.upsert({ where: { id: "opt-nefacturat" }, update: {}, create: { id: "opt-nefacturat", fieldDefinitionId: cfFacturat.id, name: "Nefacturat", color: "#6B7280", position: 2 } });

  const cfGrafica = await prisma.customFieldDefinition.upsert({
    where: { id: "cf-grafica" },
    update: {},
    create: { id: "cf-grafica", projectId: project.id, name: "Grafica", fieldType: CustomFieldType.ENUM, position: 3 },
  });
  await prisma.enumOption.upsert({ where: { id: "opt-grafica-da" }, update: {}, create: { id: "opt-grafica-da", fieldDefinitionId: cfGrafica.id, name: "Da", color: "#10B981", position: 0 } });
  await prisma.enumOption.upsert({ where: { id: "opt-grafica-nu" }, update: {}, create: { id: "opt-grafica-nu", fieldDefinitionId: cfGrafica.id, name: "Nu", color: "#F43F5E", position: 1 } });
  await prisma.enumOption.upsert({ where: { id: "opt-grafica-progress" }, update: {}, create: { id: "opt-grafica-progress", fieldDefinitionId: cfGrafica.id, name: "In progress", color: "#F59E0B", position: 2 } });

  const cfMaterial = await prisma.customFieldDefinition.upsert({
    where: { id: "cf-material" },
    update: {},
    create: { id: "cf-material", projectId: project.id, name: "Material", fieldType: CustomFieldType.TEXT, position: 4 },
  });

  const cfDebitat = await prisma.customFieldDefinition.upsert({
    where: { id: "cf-debitat" },
    update: {},
    create: { id: "cf-debitat", projectId: project.id, name: "Debitat si pregatit", fieldType: CustomFieldType.ENUM, position: 5 },
  });
  await prisma.enumOption.upsert({ where: { id: "opt-debitat-da" }, update: {}, create: { id: "opt-debitat-da", fieldDefinitionId: cfDebitat.id, name: "Da", color: "#10B981", position: 0 } });
  await prisma.enumOption.upsert({ where: { id: "opt-debitat-nu" }, update: {}, create: { id: "opt-debitat-nu", fieldDefinitionId: cfDebitat.id, name: "Nu", color: "#F43F5E", position: 1 } });
  await prisma.enumOption.upsert({ where: { id: "opt-debitat-partial" }, update: {}, create: { id: "opt-debitat-partial", fieldDefinitionId: cfDebitat.id, name: "Partial", color: "#F59E0B", position: 2 } });

  const cfBucati = await prisma.customFieldDefinition.upsert({
    where: { id: "cf-bucati" },
    update: {},
    create: { id: "cf-bucati", projectId: project.id, name: "Numar de bucati", fieldType: CustomFieldType.NUMBER, position: 6 },
  });

  await prisma.customFieldDefinition.upsert({
    where: { id: "cf-link-grafica" },
    update: {},
    create: { id: "cf-link-grafica", projectId: project.id, name: "Link grafica", fieldType: CustomFieldType.URL, position: 7 },
  });
  await prisma.customFieldDefinition.upsert({
    where: { id: "cf-link-comanda" },
    update: {},
    create: { id: "cf-link-comanda", projectId: project.id, name: "Link comanda", fieldType: CustomFieldType.URL, position: 8 },
  });

  // Secțiuni
  const sectionDeProdu = await prisma.section.upsert({
    where: { id: "section-de-produs" },
    update: {},
    create: { id: "section-de-produs", projectId: project.id, name: "De produs", position: 0 },
  });
  const sectionInProductie = await prisma.section.upsert({
    where: { id: "section-in-productie" },
    update: {},
    create: { id: "section-in-productie", projectId: project.id, name: "In productie", position: 1 },
  });
  const sectionDebitate = await prisma.section.upsert({
    where: { id: "section-debitate" },
    update: {},
    create: { id: "section-debitate", projectId: project.id, name: "Debitate", position: 2 },
  });
  await prisma.section.upsert({
    where: { id: "section-livrate" },
    update: {},
    create: { id: "section-livrate", projectId: project.id, name: "Livrate", position: 3 },
  });

  // Joburi demo
  const jobsData = [
    { id: "job-metropolis", name: "Metropolis - BN", section: sectionDeProdu.id, client: "Metropolis Hotel BN", priority: "opt-high", grafica: "opt-grafica-da", material: "Banner PVC", bucati: 3 },
    { id: "job-ivascu", name: "IVASCU", section: sectionDeProdu.id, client: "IVASCU Construct", priority: "opt-medium", grafica: "opt-grafica-nu", material: "Mesh", bucati: 5 },
    { id: "job-holiston", name: "Holiston Moldova", section: sectionDeProdu.id, client: "Hotel Holiston", priority: "opt-high", grafica: "opt-grafica-da", material: "Banner PVC 440g", bucati: 2 },
    { id: "job-mercure", name: "Mercure Oradea", section: sectionInProductie.id, client: "Mercure Hotels", priority: "opt-medium", grafica: "opt-grafica-da", material: "Roll-up 80x200", bucati: 4 },
    { id: "job-orhideea", name: "ORHIDEEA SPA", section: sectionInProductie.id, client: "Orhideea Spa Resort", priority: "opt-low", grafica: "opt-grafica-progress", material: "Plexiglas", bucati: 1 },
    { id: "job-leul-de-aur", name: "Leul de Aur", section: sectionDebitate.id, client: "Restaurant Leul de Aur", priority: "opt-medium", grafica: "opt-grafica-da", material: "Dibond 3mm", bucati: 6 },
  ];

  for (const [i, j] of jobsData.entries()) {
    const job = await prisma.job.upsert({
      where: { id: j.id },
      update: {},
      create: {
        id: j.id,
        projectId: project.id,
        sectionId: j.section,
        name: j.name,
        position: i,
        createdById: userPE.id,
        dueDate: new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.jobAssignee.upsert({
      where: { jobId_userId: { jobId: job.id, userId: userPE.id } },
      update: {},
      create: { jobId: job.id, userId: userPE.id },
    });

    await prisma.jobCustomFieldValue.upsert({
      where: { jobId_fieldDefinitionId: { jobId: job.id, fieldDefinitionId: cfClient.id } },
      update: {},
      create: { jobId: job.id, fieldDefinitionId: cfClient.id, textValue: j.client },
    });
    await prisma.jobCustomFieldValue.upsert({
      where: { jobId_fieldDefinitionId: { jobId: job.id, fieldDefinitionId: cfPriority.id } },
      update: {},
      create: { jobId: job.id, fieldDefinitionId: cfPriority.id, enumOptionId: j.priority },
    });
    await prisma.jobCustomFieldValue.upsert({
      where: { jobId_fieldDefinitionId: { jobId: job.id, fieldDefinitionId: cfGrafica.id } },
      update: {},
      create: { jobId: job.id, fieldDefinitionId: cfGrafica.id, enumOptionId: j.grafica },
    });
    await prisma.jobCustomFieldValue.upsert({
      where: { jobId_fieldDefinitionId: { jobId: job.id, fieldDefinitionId: cfMaterial.id } },
      update: {},
      create: { jobId: job.id, fieldDefinitionId: cfMaterial.id, textValue: j.material },
    });
    await prisma.jobCustomFieldValue.upsert({
      where: { jobId_fieldDefinitionId: { jobId: job.id, fieldDefinitionId: cfBucati.id } },
      update: {},
      create: { jobId: job.id, fieldDefinitionId: cfBucati.id, numberValue: j.bucati },
    });
  }

  console.log("✅ Seed completat! Workspace Calirom creat cu succes.");
  console.log(`   Users: pe@calirom.ro / ms@calirom.ro (parola: calirom2024)`);
  console.log(`   Proiect: ${project.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
