import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Container from "../components/Container";
import { useAuth } from "../state/AuthContext";
import { extractApiErrorMessage } from "../utils/apiError";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError("请填写邮箱/学号");
      return;
    }
    if (!password) {
      setError("请填写密码");
      return;
    }

    setLoading(true);
    try {
      await login(identifier, password);
      nav("/dashboard");
    } catch (err: any) {
      setError(extractApiErrorMessage(err, "登录失败，请检查账号与密码"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">登录</h1>
          <p className="mt-2 text-sm text-slate-400">
            上传 -&gt; 选择 -&gt; 查看结果。让反馈更专业，也更鼓励。
          </p>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm text-slate-300">邮箱 / 学号</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="example@school.edu 或 2023xxxxxx"
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
              />
            </div>

            {error && <div className="rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>

            <div className="text-center text-sm text-slate-400">
              还没有账号？{" "}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
                去注册
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}
