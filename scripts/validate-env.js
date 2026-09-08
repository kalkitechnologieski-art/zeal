const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required env vars: ${missing.join(", ")}`);
  console.error("Please add them to Vercel Environment Variables.");
  process.exit(1);
}
console.log("✅ All required env vars are present");
