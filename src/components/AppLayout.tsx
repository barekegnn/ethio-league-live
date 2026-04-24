import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <main className="flex-1 pb-20 lg:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
