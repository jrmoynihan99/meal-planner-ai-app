import { SidebarProvider } from "@/components/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function StepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-screen overflow-hidden bg-zinc-900 text-white">
        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0 max-w-full">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
