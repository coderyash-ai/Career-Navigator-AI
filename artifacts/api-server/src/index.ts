import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app";
import { setBattleIo } from "./routes/battle/index";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

setBattleIo(io);

io.on("connection", (socket) => {
  socket.on("join-battle", (battleId: number) => {
    socket.join(`battle-${battleId}`);
  });
  socket.on("leave-battle", (battleId: number) => {
    socket.leave(`battle-${battleId}`);
  });
});

async function seedTestUsers() {
  const testAccounts = [
    { username: "demo", email: "demo@pathAI.com", password: "demo123", avatarId: 3, points: 850 },
    { username: "testuser", email: "test@pathAI.com", password: "test123", avatarId: 7, points: 620 },
  ];

  for (const account of testAccounts) {
    const existing = await db.select().from(users).where(eq(users.email, account.email)).limit(1);
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(account.password, 10);
      await db.insert(users).values({ username: account.username, email: account.email, passwordHash, avatarId: account.avatarId, points: account.points });
      console.log(`✅ Seeded test user: ${account.email} / ${account.password}`);
    }
  }
}

httpServer.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await seedTestUsers();
});
