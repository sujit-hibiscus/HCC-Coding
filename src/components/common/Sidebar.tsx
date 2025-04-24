"use client";

import { motion } from "framer-motion";
import { ChevronRight, Contact, Key, Laptop, LayoutDashboard, LogOut, Moon, Settings, Sun, Table, User, UserPlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";

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
import { cn, logout } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useState } from "react";
import NextImage from "../ui/next-image";
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
    const isMobile = useIsMobile();
    const pathname = usePathname();
    const router = useRouter();
    const { state, open, toggleSidebar } = useSidebar();
    const { setTheme, resolvedTheme } = useTheme();
    const { resetReduxStore, selector } = useRedux();
    const { userType } = selector(state => state.user);
    const [isOpen, setIsOpen] = useState(false);

    const adminMenuOptions = userType?.toLowerCase().includes("admin") ? [
        { icon: Table, label: "Charts", href: "/dashboard/charts/pending" },
    ] : []

    const menuItems: MenuItem[] = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        ...adminMenuOptions
    ];


    const handleNavigation = (href: string, label: string) => {
        const id = href.split("/").pop() || href;

        if (onNavigate) {
            onNavigate(id, label, href);
        }

        if (!isMobile) {
            router.push(href);
        }
    };

    const { showPromiseToast } = useToast();

    const handleLogout = async () => {

        const logoutPromise = new Promise<void>(async (resolve, reject) => {
            try {
                await logout();
                resetReduxStore();
                router.push("/");
                resolve();
            } catch (error) {
                reject(error);
            }
        });

        showPromiseToast({
            promise: logoutPromise,
            loading: "Logging out...",
            error: "Failed to log out. Please try again.",
        });
    };

    const comparePaths = (path1: string, path2: string) => {
        const trimLastEntity = (path: string) => path.split("/").slice(0, -1).join("/");

        return trimLastEntity(path1) === trimLastEntity(path2);
    };

    const addUserClick = () => {
        handleNavigation("/dashboard/add-user", "Add User");
        // getUserApiCall("/dashboard/add-user");
    };

    return (
        <Sidebar collapsible="icon" className="bg-primary border-r-0 shadow-xl">
            <SidebarHeader className="p-0">
                <SidebarMenu>
                    <SidebarMenuItem className="p-0">
                        <div className="flex justify-between w-full items-center p-2">
                            <div className="flex items-center justify-center w-full">
                                {open ? (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <NextImage height={40} width={60} src="/images/ADI-cropped.svg" alt="hom" />
                                            <div className="pl-3">
                                                {["R", "E", "T", "R", "O"]?.map((item, index) => {
                                                    return <span key={index} className="ml-2 text-2xl leading-7 letter-sp text-selectedText tracking-widest font-semibold">{item}</span>;
                                                })}
                                            </div>

                                        </div>

                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <motion.div whileHover={{ scale: 1 }} whileTap={{ scale: 0.95 }} className="mb-2 w-[3rem] cursor-pointer">
                                            <NextImage height={100} width={100} src="/images/ADI-cropped.svg" alt="hom" />
                                        </motion.div>

                                    </div>
                                )}
                            </div>
                        </div>
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
                                                    onClick={() => handleNavigation(item.href, item.label)}
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
                                            onClick={addUserClick}
                                        >
                                            <motion.button whileHover={{ x: 0 }} whileTap={{ scale: 0.95 }}>
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

                    {!isMobile && (
                        <DropdownMenu>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild className="">
                                            <SidebarMenuButton className="rounded-sm  text-selectedText transition-colors hover:bg-selectedText hover:text-tabBg">
                                                {resolvedTheme === "dark" ? (
                                                    <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
                                                        <Moon className="h-[1rem] w-[1rem]" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
                                                        <Sun className="h-[1rem] w-[1rem]" />
                                                    </motion.div>
                                                )}
                                                <span>Change Theme</span>
                                            </SidebarMenuButton>
                                        </DropdownMenuTrigger>

                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center" hidden={state !== "collapsed"}>
                                        Change Theme
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <DropdownMenuContent
                                align="end"
                                className="w-[--radix-dropdown-menu-trigger-width] space-y-1 bg-selectedText text-tabBg"
                            >
                                <motion.div >
                                    <DropdownMenuItem
                                        onClick={() => setTheme("light")}
                                        className={resolvedTheme === "light" ? "!bg-tabBg !text-selectedText" : "hover:!bg-tabBg hover:!text-selectedText"}
                                    >
                                        <Sun className="mr-2 size-4 text-inherit" />
                                        <span className="text-inherit">Light</span>
                                    </DropdownMenuItem>
                                </motion.div>
                                <motion.div >
                                    <DropdownMenuItem
                                        onClick={() => setTheme("dark")}
                                        className={resolvedTheme === "dark" ? "!bg-tabBg !text-selectedText" : "hover:!bg-tabBg hover:!text-selectedText"}
                                    >
                                        <Moon className="mr-2 size-4 text-inherit" />
                                        <span className="text-inherit">Dark</span>
                                    </DropdownMenuItem>
                                </motion.div>
                                <motion.div >
                                    <DropdownMenuItem
                                        onClick={() => setTheme("system")}
                                        className="hover:!bg-tabBg hover:!text-selectedText"
                                    >
                                        <Laptop className="mr-2 size-4 text-inherit" />
                                        <span className="text-inherit">System</span>
                                    </DropdownMenuItem>
                                </motion.div>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                <DropdownMenuItem className="hover:!bg-tabBg hover:!text-selectedText">
                                    <User className="mr-2 size-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                            </motion.div>

                            <motion.div>
                                <DropdownMenuItem
                                    className="hover:!bg-tabBg hover:!text-selectedText"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setIsOpen((prev) => !prev);
                                    }}
                                >
                                    <Key className="mr-2 size-4" />
                                    <span>Change Password</span>
                                </DropdownMenuItem>
                            </motion.div>

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
        </Sidebar>
    );
}