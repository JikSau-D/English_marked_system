import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import Container from "../components/Container";
import ScoreChart from "../components/ScoreChart";
import { http } from "../api/http";
import type { EssayDetail } from "../types";

export default function EvaluationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<EssayDetail | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const essayId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    let currentObjectUrl: string | null = null;
    (async () => {
      const res = await http.get<EssayDetail>(`/essays/${essayId}`);
      setData(res.data);

      // Fetch the image as blob because <img> cannot attach Authorization header.
      const img = await http.get(`/essays/${essayId}/image`, { responseType: "blob" });
      const url = URL.createObjectURL(img.data);
      currentObjectUrl = url;
      setImgUrl(url);
    })();

    return () => {
      if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    };
  }, [essayId]);

  if (!data) {
    return (
      <Container>
        <Card>
          <div className="text-sm text-slate-400">加载中...</div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-slate-400">最终得分</div>
              <div className="text-4xl font-semibold">{data.evaluation_result.score.toFixed(1)}</div>
              <div className="text-xs text-slate-500">{data.exam_type} · {new Date(data.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-6">
            <ScoreChart breakdown={data.evaluation_result.score_breakdown} />
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium text-slate-200">原图</div>
            <div className="mt-2 overflow-hidden rounded-2xl border border-slate-800">
              {imgUrl ? (
                <img src={imgUrl} alt="essay" className="max-h-96 w-full object-contain bg-black/20" />
              ) : (
                <div className="p-6 text-sm text-slate-400">图片加载中...</div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-slate-200">OCR文本</div>
              <pre className="mt-2 max-h-56 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-300 whitespace-pre-wrap">
                {data.ocr_text}
              </pre>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-200">AI评测JSON（完整）</div>
              <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(data.evaluation_result, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
