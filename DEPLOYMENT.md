# Deploying the Enterprise GPT portal

Deploy the FastAPI service to Railway and the Next.js app to Vercel. The two
deployments must use separate project roots in this repository.

## 1. Railway API

1. In Railway, create a project from this GitHub repository and set its **Root
   Directory** to `backend`.
2. Railway reads `backend/railway.json` and starts
   `uvicorn backend.api.main:app --host 0.0.0.0 --port $PORT`.
3. Add a Railway PostgreSQL service. In the API service variables, set
   `DATABASE_URL` to the PostgreSQL service's `DATABASE_URL` reference.
4. Add these API service variables:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Railway PostgreSQL connection URL |
   | `SUPABASE_URL` | Supabase project URL |
   | `SUPABASE_KEY` | Supabase server/service key used by the chat-history table |
   | `GEMINI_API_KEY` | Google Gemini API key |
   | `ALLOWED_ORIGINS` | Your Vercel URL, e.g. `https://portal.vercel.app` |

   The API creates its SQL tables when it starts. The Supabase project must
   already contain the `chat_history` table expected by the chat routes.
5. Deploy and use the generated public URL as the API URL. Confirm that
   `https://<railway-domain>/` returns a JSON health response.

## 2. Vercel web app

1. Import the same GitHub repository into Vercel and set **Root Directory** to
   `Frontend`. Vercel detects Next.js automatically.
2. Add the environment variable below for Production, Preview, and Development:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | The Railway public URL, without a trailing slash |

3. Deploy. The login and dashboard now read this variable instead of trying to
   call `127.0.0.1`.
4. After Vercel issues its final domain, update Railway's `ALLOWED_ORIGINS` to
   that exact domain and redeploy the Railway service.

## Important operational notes

- Do not place any of the server-side keys in Vercel or prefix them with
  `NEXT_PUBLIC_`.
- This repository does not contain a prebuilt `backend/backend/vector_db`
  directory. The RAG responses need a populated Chroma vector database; create
  it during a build/deployment step or move it to persistent storage before
  expecting document-grounded answers in production. Railway's local filesystem
  is ephemeral, so uploaded documents and local vector data do not persist
  across deployments.
- The separate admin panel under `backend/backend/admin_panel` is not included
  in the Vercel deployment above. It needs its own Vercel project if you intend
  to publish it.
