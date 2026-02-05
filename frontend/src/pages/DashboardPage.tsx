import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Container from "../components/Container";
import Button from "../components/Button";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import type { EssayListItem } from "../types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [recent, setRecent] = useState<EssayListItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Trailing slash avoids FastAPI redirect which can misbehave behind proxies.
        const res = await http.get<EssayListItem[]>("/essays/");
        setRecent(res.data.slice(0, 3));
      } catch {
        setRecent([]);
      }
    })();
  }, []);

  return (
    <Container>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="relative overflow-hidden">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
            <h2 className="text-xl font-semibold">开始一次新的测评</h2>
            <p className="mt-2 text-sm text-slate-400">
              上传手写/打印作文图片，选择 CET-4 / CET-6，即可获得结构化评分与可执行改进建议。
            </p>
            <div className="mt-6">
              <Link to="/evaluate">
                <Button>开始测评</Button>
              </Link>
            </div>
          </Card>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-slate-300">最近测评</h3>
            <div className="grid gap-4">
              {recent.length === 0 ? (
                <Card>
                  <div className="text-sm text-slate-400">暂无记录，点击“开始测评”创建第一条。</div>
                </Card>
              ) : (
                recent.map((it) => (
                  <Card key={it.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-200">
                        {it.exam_type} · 分数 {it.final_score.toFixed(1)}/15
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {new Date(it.created_at).toLocaleString()} · {it.question_prompt || "未填写题目"}
                      </div>
                    </div>
                    <Link to={`/history/${it.id}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                      查看
                    </Link>
                  </Card>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link to="/history" className="text-sm text-slate-400 hover:text-white">
                查看全部历史记录 →
              </Link>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <h3 className="text-sm font-medium text-slate-300">用户信息</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="text-slate-400">用户名</div>
              <div>{user?.username || <span className="text-slate-500">加载中...</span>}</div>
              <div className="pt-2 text-slate-400">邮箱</div>
              <div className="truncate">{user?.email || <span className="text-slate-500">加载中...</span>}</div>
            </div>
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-400">
              提示：本工具提供“学习用参考范文/框架”，仅供学习，请勿直接提交，避免学术不端。
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
