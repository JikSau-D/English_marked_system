import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import Container from "../components/Container";
import Button from "../components/Button";
import StepProgress from "../components/StepProgress";
import ScoreChart from "../components/ScoreChart";
import { http } from "../api/http";
import type { EssayDetail } from "../types";
import { Link } from "react-router-dom";

const steps = [
  { key: "upload", label: "上传中" },
  { key: "ocr", label: "OCR识别" },
  { key: "ai", label: "AI分析" },
  { key: "report", label: "生成报告" },
];

export default function EvaluationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [examType, setExamType] = useState<"CET-4" | "CET-6">("CET-4");
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [stage, setStage] = useState("upload");
  const [uploadPct, setUploadPct] = useState<number | undefined>(undefined);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EssayDetail | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function start() {
    if (!file) return;
    setError(null);
    setResult(null);
    setRunning(true);
    setStage("upload");
    setUploadPct(0);

    const form = new FormData();
    form.append("exam_type", examType);
    if (questionPrompt.trim()) form.append("question_prompt", questionPrompt.trim());
    form.append("image", file);

    // UI-only "step feeling": once upload reaches 100%, move to OCR/AI while waiting for response.
    let aiTimer: number | undefined;
    try {
      const res = await http.post<EssayDetail>("/evaluate/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadPct(pct);
          if (pct >= 100) {
            setStage("ocr");
            // After upload completes, stop using upload percentage; switch to step-based progress.
            setUploadPct(undefined);
            window.clearTimeout(aiTimer);
            aiTimer = window.setTimeout(() => setStage("ai"), 1500);
          }
        },
      });
      setStage("report");
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "测评失败，请稍后重试（或检查OCR/DeepSeek配置）");
    } finally {
      window.clearTimeout(aiTimer);
      setRunning(false);
      setUploadPct(undefined);
    }
  }

  return (
    <Container>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">上传作文图片</h2>
          <p className="mt-2 text-sm text-slate-400">支持手写/打印。建议拍照清晰、光线均匀、尽量裁剪到正文区域。</p>

          <div className="mt-4">
            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-950/40 p-8 text-center transition ${
                dragging ? "border-indigo-500" : "border-slate-700 hover:border-slate-500"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) setFile(f);
              }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="text-sm text-slate-300">点击选择图片（或拖拽到此处）</div>
              <div className="mt-1 text-xs text-slate-500">PNG/JPG，建议 &lt; 10MB</div>
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
              <img src={previewUrl} alt="preview" className="max-h-80 w-full object-contain bg-black/20" />
            </div>
          )}

          <div className="mt-6 grid gap-4">
            <div>
              <label className="text-sm text-slate-300">考试类型</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
              >
                <option value="CET-4">CET-4</option>
                <option value="CET-6">CET-6</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">作文题目（可选）</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                value={questionPrompt}
                onChange={(e) => setQuestionPrompt(e.target.value)}
                placeholder="输入题目可提升切题度分析准确性"
              />
            </div>

            <Button disabled={!file || running} onClick={start}>
              {running ? "测评中..." : "开始测评"}
            </Button>

            {running && (
              <StepProgress
                steps={steps}
                currentKey={stage}
                // Only show real percentage for the upload step; afterwards use step-based progress.
                progress={stage === "upload" ? uploadPct : undefined}
              />
            )}

            {error && (
              <div className="rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">评测报告</h2>
          <p className="mt-2 text-sm text-slate-400">结构化评分 + 可执行建议。请将建议用于“改写与练习”，而非直接提交。</p>

          {!result ? (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-sm text-slate-400">
              报告将在测评完成后显示。
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-slate-400">最终得分</div>
                  <div className="text-4xl font-semibold text-white">{result.evaluation_result.score.toFixed(1)}</div>
                  <div className="text-xs text-slate-500">满分 15</div>
                </div>
                <Link to={`/history/${result.id}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                  保存记录已生成，查看详情 →
                </Link>
              </div>

              <ScoreChart breakdown={result.evaluation_result.score_breakdown} />

              <div className="grid gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-200">优秀句子摘录</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                    {result.evaluation_result.excellent_sentences?.length ? (
                      result.evaluation_result.excellent_sentences.map((s, idx) => <li key={idx}>{s}</li>)
                    ) : (
                      <li className="text-slate-500">暂无</li>
                    )}
                  </ul>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-200">语法错误（重点）</div>
                  <div className="mt-2 space-y-3">
                    {result.evaluation_result.grammar_errors?.length ? (
                      result.evaluation_result.grammar_errors.map((g, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                          <div className="text-sm text-slate-200">{g.sentence}</div>
                          <div className="mt-1 text-xs text-rose-200">错误：{g.error}</div>
                          <div className="mt-1 text-xs text-emerald-200">建议：{g.correction}</div>
                          <div className="mt-2 text-xs text-slate-400">{g.explanation}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">暂无</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-200">词汇替换建议</div>
                  <div className="mt-2 grid gap-3">
                    {result.evaluation_result.vocabulary_suggestions?.length ? (
                      result.evaluation_result.vocabulary_suggestions.map((v, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                          <div className="text-sm text-slate-200">
                            <span className="text-slate-400">原词：</span>
                            {v.original}
                          </div>
                          <div className="mt-1 text-sm text-slate-200">
                            <span className="text-slate-400">替换：</span>
                            {v.suggestion}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">{v.context}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">暂无</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-200">总体改进建议</div>
                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300 whitespace-pre-wrap">
                    {result.evaluation_result.improvement_suggestions}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-200">学习用参考范文/框架</div>
                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300 whitespace-pre-wrap">
                    {result.evaluation_result.model_essay}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
