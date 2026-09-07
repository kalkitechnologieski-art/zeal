import Dexie from "dexie";

export const db = new Dexie("ZealDB");
db.version(1).stores({
  consultants: "id, name, category, rating",
  aiChats: "++id, sessionId, message, timestamp",
  userPrefs: "userId",
});
db.version(2).stores({
  consultants: "id, name, category, rating, isOnline",
  aiChats: "++id, sessionId, message, timestamp, isFromAI",
});

export default db;
