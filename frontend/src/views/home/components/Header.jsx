import React from "react";
import { CloudCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../auth/AuthProvider";

const Header = () => {
  const { authLogout } = useAuth();
  const handleLogout = () => {
    authLogout();
  };
  return (
    <div className="flex items-center  w-full h-20 bg-[oklch(0.795_0.184_86.047)]">
      <div className="flex items-center pl-5 gap-3 w-8/10 h-full ">
        <CloudCheck size={40} />
        <p className="">Save Link App</p>
      </div>
      <div className="flex items-center justify-end pr-5 w-2/10 h-full">
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Header;
