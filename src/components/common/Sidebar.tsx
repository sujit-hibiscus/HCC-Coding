"use client";

import { motion } from "framer-motion";
import { ChevronRight, FileText, LayoutDashboard, LogOut, Settings, Table, UserPlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";

import { logoutAction } from "@/app/action/auth-actions";
import {
    Dialog
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import { targetTabs } from "@/lib/types/chartsTypes";
import { cn } from "@/lib/utils";
import { setPageLoading } from "@/store/slices/DashboardSlice";
import { useState } from "react";
import { useApiCall } from "./ApiCall";
import { ChangePassword } from "./user/change-password";

interface MenuItem {
    icon: React.ElementType
    label: string
    href: string
}



interface AppSidebarProps {
    onNavigate?: (id: string, title: string, href: string) => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { state, open, toggleSidebar } = useSidebar();
    const { resetReduxStore, selector, dispatch } = useRedux();
    const { userType } = selector(state => state.user);
    const [isOpen, setIsOpen] = useState(false);
    const { getChartApi, getUserApiCall } = useApiCall();

    const adminMenuOptions = userType?.toLowerCase().includes("admin") ? [
        { icon: Table, label: "Charts", href: "/dashboard/charts/pending" },
    ] : [];
    const OtherMenuOptionOptions = userType?.toLowerCase().includes("admin") ? [] : [{ icon: FileText, label: "Documents", href: "/dashboard/document" },];

    const menuItems: MenuItem[] = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        ...OtherMenuOptionOptions,
        ...adminMenuOptions
    ];


    const handleNavigation = (href: string, label: string) => {
        const id = href.split("/").pop() || href;
        dispatch(setPageLoading(true))

        setTimeout(() => {
            if (targetTabs.some(status => id.includes(status))) {
                if (id !== 'document') {
                    getChartApi(id as "pending" | "assigned" | "audit" | "completed" | "document");
                }
            }

            if (onNavigate) {
                onNavigate(id, label, href);
            }
        });

        router.push(href);
    };

    const { showPromiseToast } = useToast();

    const handleLogout = async () => {
        await logoutAction();
        setTimeout(() => {
            resetReduxStore();
        }, 1000);
        router.push("/");
    };

    const comparePaths = (path1: string, path2: string) => {
        const trimLastEntity = (path: string) => path.split("/").slice(0, -1).join("/");

        return trimLastEntity(path1) === trimLastEntity(path2);
    };

    const addUserClick = () => {
        handleNavigation("/dashboard/add-user", "Add User");
        getUserApiCall("/dashboard/add-user");
    };

    const appName = "HCC-Coding";
    return (
        <Sidebar collapsible="icon" className="bg-primary border-r-0 shadow-xl">
            <SidebarHeader className="p-0">
                <SidebarMenu>
                    <SidebarMenuItem className={`${open ? "p-0" : "py-1"}`}>
                        {open && <div className="flex justify-between w-full items-center p-2">
                            <div className="flex items-center justify-center w-full">

                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        {/* <NextImage height={40} width={60} src="/images/ADI-cropped.svg" alt="hom" /> */}
                                        <div className="pl-3">
                                            <motion.div
                                                className="flex"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {appName?.split("")?.map((item, index) => (
                                                    <motion.span
                                                        key={index}
                                                        className="ml-[1px] text-2xl leading-7 letter-sp text-selectedText tracking-widest font-semibold"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{
                                                            duration: 0.2,
                                                            delay: index * 0.03,
                                                            type: "spring",
                                                            stiffness: 200
                                                        }}
                                                    >
                                                        {item}
                                                    </motion.span>
                                                ))}
                                            </motion.div>
                                        </div>

                                    </div>

                                </div>

                                <>
                                    {/*    <div className="flex flex-col items-center">
                                                <motion.div whileHover={{ scale: 1 }} whileTap={{ scale: 0.95 }} className="mb-2 w-[3rem] cursor-pointer">
                                                    <NextImage height={100} width={100} src="/images/ADI-cropped.svg" alt="hom" />
                                                </motion.div>

                                            </div> */}
                                </>
                            </div>
                        </div>}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 ">
                <SidebarMenu>
                    {menuItems.map((item, index) => {
                        const isActive = comparePaths(pathname, item?.href);
                        return (
                            <SidebarMenuItem key={index} className="my-0">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className={cn(
                                                    "rounded-none transition-all duration-200 hover:bg-selectedText text-selectedText hover:text-white",
                                                    isActive && "bg-red-500 text-selectedText",
                                                )}
                                            >
                                                <motion.button
                                                    onClick={() => isActive ? undefined : handleNavigation(item.href, item.label)}
                                                    whileHover={{ x: 0 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={isActive ? "!bg-selectedText hover:text-tabBg text-tabBg" : ""}
                                                >
                                                    <item.icon className={isActive ? "text-tabBg" : ""} />
                                                    <span className={cn(isActive ? "text-tabBg" : "")}>{item.label}</span>
                                                </motion.button>
                                            </SidebarMenuButton>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" align="center" hidden={state !== "collapsed"}>
                                            {item.label}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t-2 border-selectedText">
                <SidebarMenu>
                    {userType?.toLowerCase().includes("admin") && (
                        <SidebarMenuItem>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton
                                            asChild
                                            className="rounded-sm text-selectedText transition-colors hover:bg-selectedText hover:text-tabBg"
                                            onClick={pathname !== "/dashboard/add-user" ? addUserClick : undefined}
                                        >
                                            <motion.button
                                                className={pathname === "/dashboard/add-user" ? "!bg-selectedText disabled:!bg-selectedText hover:text-tabBg !text-tabBg" : "!hover:bg-selectedText"}
                                                whileHover={{ x: 0 }} whileTap={{ scale: 0.95 }}>
                                                <UserPlus className="h-[1rem] w-[1rem]" />
                                                <span>Add User</span>
                                            </motion.button>
                                        </SidebarMenuButton>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center" hidden={state !== "collapsed"}>
                                        Add User
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </SidebarMenuItem>
                    )}

                    <DropdownMenu modal={false}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton className="rounded-sm text-selectedText transition-colors hover:bg-selectedText hover:text-tabBg">
                                            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
                                                <Settings className="h-[1rem] w-[1rem]" />
                                            </motion.div>
                                            <span>Settings</span>
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center" hidden={state !== "collapsed"}>
                                    Setting
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width] bg-selectedText text-tabBg">
                            <motion.div>
                                <DropdownMenuItem
                                    onClick={() => handleLogout()}
                                    className="hover:!bg-tabBg hover:!text-selectedText"
                                >
                                    <LogOut className="mr-2 size-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </motion.div>
                        </DropdownMenuContent>

                        {/* Change Password Modal */}
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <ChangePassword isOpen={isOpen} setIsOpen={setIsOpen} />
                        </Dialog>
                    </DropdownMenu>
                </SidebarMenu>
            </SidebarFooter>

            <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-8 bg-selectedText/90 hover:bg-selectedText shadow-lg cursor-pointer flex items-center justify-center"
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ clipPath: "ellipse(0% 40% at 0% 48%)", x: 0 }}
                animate={{ clipPath: "ellipse(80% 52% at 6% 49%)", x: 30 }}
                transition={{ type: "spring", stiffness: 250, damping: 15 }}
                onClick={toggleSidebar}
            >
                <div className="relative h-full w-full">
                    <div className={cn("absolute top-2.5 ", (open ? "right-2.5" : "right-[8]"))}>
                        <motion.div
                            animate={{ rotate: open ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        >
                            <ChevronRight className="w-5 font-semibold h-5 text-white" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
            <SidebarRail />
        </Sidebar >
    );
}
