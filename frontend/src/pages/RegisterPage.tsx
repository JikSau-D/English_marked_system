import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Container from "../components/Container";
import { useAuth } from "../state/AuthContext";
import { extractApiErrorMessage } from "../utils/apiError";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const em = email.trim();
    if (!u) {
      setError("请填写用户名（建议填写学号）");
      return;
    }
    if (!em) {
      setError("请填写邮箱");
      return;
    }
    if (!password) {
      setError("请填写密码（至少8位）");
      return;
    }
    if (password.length < 8) {
      setError("密码长度不足（至少8位）");
      return;
    }

    setLoading(true);
    try {
      await register(u, em, password);
      // Optional: auto-login after register.
      await login(em, password);
      nav("/dashboard");
    } catch (err: any) {
      setError(extractApiErrorMessage(err, "注册失败，请检查输入信息"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">注册</h1>
          <p className="mt-2 text-sm text-slate-400">建议用户名填写学号，便于登录与管理。</p>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm text-slate-300">用户名（可填学号）</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="2023xxxxxx"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">邮箱</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.edu"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">密码</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少8位"
                autoComplete="new-password"
              />
              <div className="mt-2 text-xs text-slate-500">提示：建议使用英文+数字组合，避免过短。</div>
            </div>

            {error && <div className="rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中..." : "创建账号"}
            </Button>

            <div className="text-center text-sm text-slate-400">
              已有账号？{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
                去登录
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}
