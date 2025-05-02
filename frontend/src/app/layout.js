import "./globals.css";
import {Montserrat} from "next/font/google";
import { RecipeProvider } from "@/context/RecipeContext";
import { UserProvider } from "@/context/UserContext";
import Header from "@/components/Header";
import DesktopSidebar from "@/components/DesktopSidebar";
import MobileMenu from "@/components/MobileMenu";

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
                <RecipeProvider>
                    <UserProvider>
                        <Header />
                        <div className="flex flex-1">
                            <DesktopSidebar />
                            <main className="flex-1 md:pl-64 pt-12 bg-[#F5F2F2] h-full pb-16 md:pb-0">
                                {children}
                            </main>
                        </div>
                        <MobileMenu />
                    </UserProvider>
                </RecipeProvider>
            </body>
        </html>
    );
}