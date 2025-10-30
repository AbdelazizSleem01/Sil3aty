"use client";
import { useSession } from "next-auth/react";

export default function AdminButton() {
  const { data: session } = useSession();

  if (!session?.user?.isAdmin) return null;

  return (
    <button className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600">
      Admin Feature
    </button>
  );
}
