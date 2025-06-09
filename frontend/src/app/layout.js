import "./globals.css";
import { Montserrat } from "next/font/google";
import MainProvider from "@/providers/MainProvider";
import Header from "@/components/layout/Header";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/ui/CookieConsent";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import MainContent from "@/components/layout/MainContent";

const montserrat = Montserrat({
    variable: "--font-main",
    weight: ["400", "500", "600", "700"],
    subsets: ["cyrillic"],
})

export const metadata = {
    title: "Рецепты - Ваши любимые рецепты и кулинарные идеи",
    description: "Найдите лучшие рецепты, советы по кулинарии и идеи для приготовления блюд.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru" className={montserrat.variable}>
            <head />
            <body className="min-h-screen bg-gradient-to-b from-background to-chart-4/10 font-main">
                <ErrorBoundary>
                    <MainProvider>
                        <Header />
                        <div className="flex flex-1">
                            <DesktopSidebar />
                            <MainContent>
                                {children}
                            </MainContent>
                        </div>
                        <MobileMenu />
                        <CookieConsent />
                        <Toaster />
                    </MainProvider>
                </ErrorBoundary>

                {/* Защита от ошибок расширений браузера */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.addEventListener('error', function(e) {
                            if (e.message && e.message.includes('applyDebugConsole')) {
                                e.preventDefault();
                                console.warn('Игнорируем ошибку расширения браузера:', e.message);
                                return false;
                            }
                        });
                    `
                }} />
            </body>
        </html>
    );
}