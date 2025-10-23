import { nanoid } from "nanoid";
import * as db from "./db";

// Utilizadores padrão do sistema ATMJ Legal
const defaultUsers = [
  {
    id: "admin-jaime-martins",
    name: "A. Jaime Martins",
    email: "a.jaimemartins@atmj.pt",
    role: "admin" as const,
    loginMethod: "oauth",
  },
  {
    id: "advogado-2",
    name: "Advogado ATMJ",
    email: "advogado@atmj.pt",
    role: "user" as const,
    loginMethod: "oauth",
  },
  {
    id: "cliente-1",
    name: "Cliente 1",
    email: "cliente1@example.com",
    role: "user" as const,
    loginMethod: "oauth",
  },
  {
    id: "cliente-2",
    name: "Cliente 2",
    email: "cliente2@example.com",
    role: "user" as const,
    loginMethod: "oauth",
  },
  {
    id: "cliente-3",
    name: "Cliente 3",
    email: "cliente3@example.com",
    role: "user" as const,
    loginMethod: "oauth",
  },
  {
    id: "cliente-4",
    name: "Cliente 4",
    email: "cliente4@example.com",
    role: "user" as const,
    loginMethod: "oauth",
  },
];

// Pastas padrão para estrutura inicial
const defaultFolders = [
  {
    id: nanoid(),
    name: "Honorários",
    type: "honorarios" as const,
    createdBy: "admin-jaime-martins",
  },
];

export async function seedDefaultData() {
  console.log("🌱 A inicializar dados padrão...");

  try {
    // Criar utilizadores padrão
    for (const user of defaultUsers) {
      await db.upsertUser(user);
      console.log(`✅ Utilizador criado: ${user.name} (${user.email})`);
    }

    // Criar pastas padrão
    for (const folder of defaultFolders) {
      await db.createFolder(folder);
      console.log(`✅ Pasta criada: ${folder.name}`);
    }

    console.log("✅ Dados padrão inicializados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar dados padrão:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDefaultData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
