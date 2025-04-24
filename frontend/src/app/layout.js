import "./globals.css";

import Header from "@/components/Header";
import DesktopSidebar from "@/components/DesktopSidebar";
import MobileMenu from "@/components/MobileMenu";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body className="min-h-screen">
              <Header />
              <div className="flex flex-1">
                  <DesktopSidebar />
                  <main className="flex-1 md:pl-64 pt-12 bg-[#F5F2F2]">
                      {children}
                      <Footer />
                  </main>
              </div>
              <MobileMenu />
            </body>
        </html>
    );
}