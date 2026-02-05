import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../state/AuthContext";

export default function TopNav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="border-b border-slate-900 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/dashboard" className="font-semibold tracking-wide">
          大学英语作文评测助手
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/evaluate" className="text-sm text-slate-300 hover:text-white">
            开始测评
          </Link>
          <Link to="/history" className="text-sm text-slate-300 hover:text-white">
            历史记录
          </Link>
          {user && <span className="hidden text-sm text-slate-400 md:inline">Hi, {user.username}</span>}
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              nav("/login");
            }}
          >
            退出
          </Button>
        </div>
      </div>
    </div>
  );
}

