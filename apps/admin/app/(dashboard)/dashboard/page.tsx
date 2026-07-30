import { Card, CardHeader, CardTitle, CardContent } from "@zeal/ui";
export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#5E4B8B] mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent>1,234</CardContent></Card>
        <Card><CardHeader><CardTitle>Healers</CardTitle></CardHeader><CardContent>56</CardContent></Card>
        <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent>₹ 12,345</CardContent></Card>
        <Card><CardHeader><CardTitle>Consultations</CardTitle></CardHeader><CardContent>78</CardContent></Card>
      </div>
    </div>
  );
}
