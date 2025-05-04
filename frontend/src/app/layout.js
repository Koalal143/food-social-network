import "./globals.css";
import {Montserrat} from "next/font/google";
import MainProvider from "@/providers/MainProvider";
import Header from "@/components/layout/Header";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    weight: ["400", "500", "600", "700"],
    subsets: ["cyrillic"],
})

export const metadata = {
    title: "Рецепты - Ваши любимые рецепты и кулинарные идеи",
    description: "Найдите лучшие рецепты, советы по кулинарии и идеи для приготовления блюд.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
            <head />
            <body className="min-h-screen bg-gradient-to-b from-background to-secondary/100">
                <MainProvider>
                    <Header />
                    <div className="flex flex-1">
                        <DesktopSidebar />
                        <main className="flex-1 md:pl-64 pt-12  h-full pb-16 md:pb-0">
                            {children}
                        </main>
                    </div>
                    <MobileMenu />
                    <Toaster />
                </MainProvider>
            </body>
        </html>
    );
}