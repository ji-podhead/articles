# How to Use Coding Agents (and Their Context Windows) Without Losing Your Project

**Published:** 2026-09-16 · **Author:** Leonardo Jacobi · **Tags:** #Coding #LLM #Agentics #AI #Agents #ContextEngineering

Coding agents are powerful — until their context window silently kills your project state. After months of running agentic development sessions (multiple parallel agents, long-running coding tasks, documentation-heavy repos), here are the rules that actually work.

## 1. Ask Your Model to Update Memory Frequently

Have your agent update its memory (CLAUDE.md, AGENTS.md, session notes) — but **only when it has very important information**: project decisions, system instructions, architectural mandates. Everything else is noise that bloats the memory file.

## 2. Don't Use Autocompact — Create Proper Documentation

Autocompact silently summarizes your session and loses detail. Instead:
- Create real documentation files (sprint files, task files, handoffs)
- If the agent needs context, it reads the documentation — not a lossy auto-summary

## 3. Clear the Conversation at the Token Limit

When a session reaches its token limit, clear it. A stuffed context window degrades reasoning quality long before the hard limit hits. Fresh session + good docs beats a bloated session every time.

## 4. Avoid Token Bloat — Point to Files, Don't Paste Them

Don't paste entire files or long documents into the conversation. Point your agents to the documentation files, sprint files, and epic documents. The agent reads what it needs — the context window stays lean.

## 5. Avoid the "Lost in the Middle" Problem

LLMs remember the beginning and end of their context best — the middle gets lost. Keep critical instructions at the edges: system prompts and final instructions. Long documents in the middle of a session are effectively invisible.

## 6. Use RAG for Code/File Indexing as Projects Grow

Once your project grows past a few hundred files, use retrieval instead of stuffing:
- Claude Code integrations for codebase indexing
- Roo Code codebase indexing
- Embedding-based search over your docs

## 7. Don't Use MCP If You Don't Need It

Every MCP server adds context overhead, attack surface, and failure modes. If a task doesn't need external tools, don't load them. As Matt Pocock's video puts it: don't use MCP if you don't need it.

## The Bottom Line

Treat the context window like RAM in the 90s: it's finite, it's precious, and fragmentation kills performance. Documentation is your swap space — write it once, reference it everywhere.

---

## Sources

- [Lost in the Middle: Language Models Use Long Contexts Confusably](https://arxiv.org/abs/2307.03172) (referenced)
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) (referenced)
- [Roo Code codebase indexing](https://roocode.com/) (referenced)
