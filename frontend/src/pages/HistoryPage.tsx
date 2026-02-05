import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Container from "../components/Container";
import { http } from "../api/http";
import type { EssayListItem } from "../types";

export default function HistoryPage() {
  const [items, setItems] = useState<EssayListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Trailing slash avoids FastAPI redirect which can misbehave behind proxies.
        const res = await http.get<EssayListItem[]>("/essays/");
        setItems(res.data);
        setError(null);
      } catch (err: any) {
        setItems([]);
        setError(err?.response?.data?.detail || "获取历史记录失败（可能是登录过期），请尝试重新登录。");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Container>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">历史记录</h2>
          <p className="mt-2 text-sm text-slate-400">点击任意记录可完整复现当次报告（原图、OCR文本、AI JSON）。</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <Card>
            <div className="text-sm text-slate-400">加载中...</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-sm text-rose-200">{error}</div>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <div className="text-sm text-slate-400">暂无记录</div>
          </Card>
        ) : (
          items.map((it) => (
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
                查看详情
              </Link>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
}
