import express from "express";
import { setupAuth, isAuthenticated } from "./googleAuth.js";
import { storage } from "./storage.js";

const app = express();
const PORT = 3000;

app.use(express.json());

async function main() {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
