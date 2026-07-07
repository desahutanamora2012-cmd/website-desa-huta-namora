import type { ReactNode } from "react";
import Navbar from "./Navbar";
import RunningText from "./RunningText";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-0">{children}</main>

      <Footer />
      <RunningText />
    </div>
  );
}
