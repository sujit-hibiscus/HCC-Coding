"use client";

import ChromeTabBar from "@/components/common/Chrome-tab-bar";
import { Header } from "@/components/common/Header";
import RouteProgressWrapper from "@/components/common/RouteProgressWrapper";
import { AppSidebar } from "@/components/common/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTabs } from "@/hooks/use-tabs";
import { type ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { addTab } = useTabs();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar onNavigate={addTab} />

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />

          {/* Chrome Tab Bar - Sticky */}
          <div className="sticky z-50 top-[4rem] md:top-0">
            <div className="flex h-full justify-between">
              <ChromeTabBar />
            </div>
          </div>

          {/* Main Content */}
          <main
            style={{
              height: "calc(100% - var(--header-height) - var(--tab-bar-height))",
              "--header-height": "0.4rem",
              "--tab-bar-height": "2.5rem"
            } as React.CSSProperties}
            className="flex-1 min-h-0 overflow-y-auto relative">

            <div className={"opacity-100 transition-opacity duration-300 h-full"}>
              <RouteProgressWrapper>
                {children}
              </RouteProgressWrapper>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
