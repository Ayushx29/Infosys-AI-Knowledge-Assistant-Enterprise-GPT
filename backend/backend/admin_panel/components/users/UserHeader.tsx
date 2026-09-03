import AddUserModal from "./AddUserModal";
import { useState } from "react";

export default function UserHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-3xl font-bold">
          Users
        </h1>

        <p className="mt-2 text-slate-500">
          Manage employees and department access.
        </p>
      </div>

      <AddUserModal open={open} onOpenChange={setOpen} />

    </div>
  );
}
