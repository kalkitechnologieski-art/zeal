"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from "@zeal/ui";
import { Search, UserPlus, MoreHorizontal } from "lucide-react";

const mockUsers = [
  { id: "u1", name: "Rajesh Kumar", email: "rajesh@example.com", role: "USER", status: "active", joined: "2026-01-15" },
  { id: "u2", name: "Priya Sharma", email: "priya@example.com", role: "HEALER", status: "active", joined: "2026-02-20" },
  { id: "u3", name: "Amit Singh", email: "amit@example.com", role: "USER", status: "inactive", joined: "2026-03-10" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState("");
  const filtered = mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white">Users</h1>
        <Button variant="primary" size="sm">
          <UserPlus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A1D9]" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="border-[#E1C5E7] dark:border-gray-700">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-[#F4E8F7] dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Name</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Email</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Role</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Status</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Joined</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1C5E7] dark:divide-gray-700">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#F4E8F7] dark:hover:bg-gray-800/50">
                  <td className="p-3 text-sm text-[#5E4B8B] dark:text-white">{user.name}</td>
                  <td className="p-3 text-sm text-[#5E4B8B] dark:text-white">{user.email}</td>
                  <td className="p-3 text-sm">
                    <Badge variant={user.role === "HEALER" ? "success" : "default"}>{user.role}</Badge>
                  </td>
                  <td className="p-3 text-sm">
                    <Badge variant={user.status === "active" ? "success" : "secondary"}>{user.status}</Badge>
                  </td>
                  <td className="p-3 text-sm text-[#5E4B8B] dark:text-white">{user.joined}</td>
                  <td className="p-3 text-sm">
                    <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
