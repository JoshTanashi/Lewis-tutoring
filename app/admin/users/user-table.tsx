"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setUserRole } from "@/app/actions/admin";
import { fmtDate } from "@/components/portal/widgets";
import { Card, Chip, Select } from "@/components/ui";
import type { Role } from "@/lib/roles";

type User = {
  id: string;
  full_name: string;
  role: Role;
  phone: string | null;
  created_at: string;
};

const ROLE_TONE: Record<Role, "sky" | "coral" | "sunshine" | "lilac"> = {
  parent: "sky",
  student: "sunshine",
  tutor: "coral",
  super_admin: "lilac",
};

export function UserTable({ users, meId }: { users: User[]; meId: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(id: string, role: Role) {
    setBusyId(id);
    setError(null);
    const res = await setUserRole(id, role);
    if (!res.ok) setError(res.error);
    setBusyId(null);
    router.refresh();
  }

  return (
    <Card className="overflow-x-auto p-2">
      {error && (
        <p className="m-2 rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">{error}</p>
      )}
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-soft">
            <th className="p-3">Name</th>
            <th className="p-3">Role</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Joined</th>
            <th className="p-3">Change role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-line">
              <td className="p-3 font-bold">
                {u.full_name || "—"}
                {u.id === meId && <span className="ml-1 text-xs text-ink-soft">(you)</span>}
              </td>
              <td className="p-3">
                <Chip tone={ROLE_TONE[u.role]}>{u.role.replace("_", " ")}</Chip>
              </td>
              <td className="p-3 text-ink-soft">{u.phone ?? "—"}</td>
              <td className="p-3 text-ink-soft">{fmtDate(u.created_at)}</td>
              <td className="p-3">
                <Select
                  value={u.role}
                  disabled={busyId === u.id || u.id === meId}
                  onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  className="!w-auto !py-1.5 text-xs"
                >
                  <option value="parent">parent</option>
                  <option value="student">student</option>
                  <option value="tutor">tutor</option>
                  <option value="super_admin">super admin</option>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
