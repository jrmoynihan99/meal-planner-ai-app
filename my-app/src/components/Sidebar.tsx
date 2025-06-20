"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { CloseButton } from "@/components/CloseButton";

const steps = [
  { name: "Setup", path: "/step-one-setup" },
  { name: "Planner", path: "/step-two-planner" },
  { name: "Schedule", path: "/step-three-schedule" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <aside
      className={`fixed sm:static z-40 top-0 left-0 h-full w-64 bg-zinc-900 text-white border-r border-zinc-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
    >
      {/* Close button — mobile only */}
      <div className="sm:hidden flex justify-end p-4 pb-2">
        <CloseButton onClick={close} />
      </div>

      <nav className="p-6 pt-2 space-y-4">
        {steps.map((step) => {
          const isActive = pathname === step.path;
          return (
            <div
              key={step.path}
              className={`${
                isActive ? "bg-zinc-700 text-white" : "text-gray-300"
              } px-4 py-2 rounded-xl transition`}
            >
              <Link href={step.path} onClick={close}>
                {step.name}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
