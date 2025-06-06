"use client";

import ChromeTabBar from "@/components/common/Chrome-tab-bar";
import { Header } from "@/components/common/Header";
import LogoutTransition from "@/components/common/LogoutTransition";
import { AppSidebar } from "@/components/common/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRedux } from "@/hooks/use-redux";
import { useTabs } from "@/hooks/use-tabs";
import { type ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { addTab } = useTabs();
  const { selector } = useRedux();
  const token = selector(state => state.user.token) || "";
  if (!(token?.length > 0)) {
    return <LogoutTransition />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar onNavigate={addTab} />

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />

          {/* Chrome Tab Bar - Sticky */}
          <div className="sticky z-50 top-[4rem] md:top-0">
            <div className="flex h-full justify-between">
              <ChromeTabBar />
              {/*  <div className="w-full h-full dark:bg-accent pr-5 max-w-[20rem]">
                <GlobalSearchBar />
              </div> */}
            </div>
          </div>

          {/* Main Content */}
          <main
            style={{
              height: "calc(100% - var(--header-height) - var(--tab-bar-height))",
              "--header-height": "0.4rem",
              "--tab-bar-height": "2.5rem"
            } as React.CSSProperties}
            className="flex-1 min-h-0 overflow-y-auto">
            <div className="h-full">{children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
