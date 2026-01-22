# CREA: Infrastructure Setup Guide

Since this is a robust "AI Chief of Staff" application, it needs a brain (Database) to work. We use **Supabase** for this.

Follow these 4 steps to get everything running in 5 minutes.

## 1. Create a Project
1.  Go to [database.new](https://database.new) (redirects to Supabase).
2.  Sign up/Log in.
3.  Click **New Project**.
4.  Name it: `CREA Cortex`.
5.  Set a database password (save it somewhere).
6.  Region: Choose one close to you (e.g., US East).
7.  Click **Create New Project**.

## 2. Connect the App (API Keys)
1.  Once the project is created, look at the "Project Settings" (Cog icon) -> **API**.
2.  Find **Project URL**. Copy it.
3.  Find **anon public** key. Copy it.
4.  Open the file `.env.local` in your code editor (rename `.env.example` if needed).
5.  Paste them in:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-long-anon-key-here
    ```

## 3. Build the Brain (Run SQL)
We need to create the Tables and the Vector Search logic. I have prepared the scripts for you in the codebase.

1.  In Supabase, find the **SQL Editor** icon (`>_`) on the left sidebar.
2.  Click **New Query**.
3.  Copy/Paste the contents of these files **one by one** and click **Run** for each:

    **Order Matters:**
    1.  `schema.sql` (Creates the 7 Buckets/Tables)
    2.  `rpc.sql` (Enables Vector Search)
    3.  `rls_policies.sql` (Enables Permissions so you can save data)

## 4. Restart
1.  Go to your terminal.
2.  Stop the server (Ctrl+C).
3.  Run `npm run dev`.

**Done!** Now go to `http://localhost:3000/dashboard/tasks` and try creating a task.
