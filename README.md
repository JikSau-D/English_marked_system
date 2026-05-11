# 2026大学英语作文打分评测助手 (University English Composition Grading & Evaluation Assistant)

一个可直接部署的全栈 Web 应用：上传作文图片 → OCR 识别 → 基于 CET-4/CET-6 评分标准给出结构化评分与改进建议。

> 学术诚信提示：本工具的核心目标是“帮助你改进写作”。系统会提供学习用参考框架/示例句，但不鼓励、也不支持代写/替写；请勿直接提交生成内容。

## 功能概览

- 用户系统：注册 / 登录 / JWT 鉴权
- 核心测评：图片上传 → 百度云手写 OCR → DeepSeek 评测生成 JSON 报告
- 报告展示：最终 15 分制分数、三维雷达图、优秀句子、语法错误清单、词汇替换建议、总体改进建议、学习用参考框架
- 历史记录：列表 + 详情页（原图、OCR 文本、完整 JSON 报告）

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS + Axios + Recharts
- 后端：FastAPI + SQLAlchemy + Alembic + JWT + httpx (async)
- 数据库：PostgreSQL
- 部署：Docker + docker-compose

## 目录结构

```
.
├─ backend/
│  ├─ app/
│  │  ├─ main.py                  # FastAPI 入口
│  │  ├─ core/                    # 配置与安全
│  │  ├─ db/                      # SQLAlchemy engine/session/base
│  │  ├─ models/                  # users/essays ORM
│  │  ├─ routers/                 # /api/auth /api/evaluate /api/essays
│  │  ├─ schemas/                 # Pydantic schema
│  │  ├─ services/                # OCR/AI/存储服务
│  ├─ prompts/evaluation_prompt.txt
│  ├─ alembic/                    # 数据库迁移
│  ├─ requirements.txt
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  │  ├─ pages/                   # Login/Register/Dashboard/Evaluate/History/Detail
│  │  ├─ components/              # UI 组件
│  │  └─ state/                   # AuthContext
│  ├─ package.json
│  ├─ nginx.conf                  # 生产容器反代 /api 到 backend
│  └─ Dockerfile
├─ docker-compose.yml
├─ .env.example
└─ scripts/start.sh
```

## 快速开始（推荐：Docker Compose）

1) 准备环境变量

```bash
cp .env .env
```

编辑 `.env`，至少需要设置：

- `JWT_SECRET_KEY`
- `BAIDU_OCR_API_KEY` / `BAIDU_OCR_SECRET_KEY`
- `DEEPSEEK_API_KEY`

2) 一键启动

```bash
bash scripts/start.sh
```

启动完成后：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8000` （Swagger：`/docs`）

## API 简表

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/evaluate/`（multipart/form-data：`image`, `exam_type`, `question_prompt?`）
- `GET /api/essays`
- `GET /api/essays/{id}`
- `GET /api/essays/{id}/image`

## 重要说明（OCR / DeepSeek）

- Baidu OCR 调用实现基于公开接口形态：先取 `access_token`，再调用手写识别接口 `/rest/2.0/ocr/v1/handwriting`，并设置 `language_type=ENG`、`recognize_granularity=small`。
- DeepSeek 调用采用 OpenAI-compatible `chat/completions` 形态（默认 `DEEPSEEK_BASE_URL=https://api.deepseek.com/v1`，可通过 `.env` 修改）。

如果你的本地“百度云 OCR 技术文档 / DeepSeek 文档”与默认实现存在差异，请在以下位置微调：

- `backend/app/services/ocr_service.py`
- `backend/app/services/ai_evaluation_service.py`
- `backend/prompts/evaluation_prompt.txt`
