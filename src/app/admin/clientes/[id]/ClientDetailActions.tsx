"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import EditClientModal from "./EditClientModal";

interface Props {
  userId: string;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
    birth_date: string | null;
    referral_source: string | null;
    objective: string | null;
    medical_notes: string | null;
    notes: string | null;
    preferred_contact: string | null;
    instagram_handle: string | null;
  };
}

export default function ClientDetailActions({ userId, profile }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-alma-dark text-sm rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
      >
        <Pencil size={14} />
        Editar
      </button>

      {open && (
        <EditClientModal
          userId={userId}
          profile={profile}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
