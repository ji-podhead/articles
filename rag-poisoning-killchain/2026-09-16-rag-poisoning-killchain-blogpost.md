# From an Open Port to Agent Takeover: RAG Poisoning and the Full Kill Chain

An open port and a poisoned vector database look like unrelated problems — one is a network-layer misconfiguration, the other is a data-integrity issue inside an AI application. In an agentic system, they're the same problem at two different stages of one kill chain. This article covers how vector-database poisoning actually works, how it differs from two other AI-specific failure modes it gets confused with, and how a real attack chains all three into full agent compromise.

## RAG Poisoning: Making the Model Trust a Lie

Retrieval-Augmented Generation systems fetch relevant text from a vector database and hand it to the LLM as context, on the (mostly correct, and mostly unexamined) assumption that retrieved text is trustworthy background, not instructions. **RAG poisoning** — also called indirect prompt injection via retrieval — breaks that assumption by placing attacker-controlled text somewhere the pipeline will eventually ingest and embed: a public wiki page, a PDF, a customer support ticket, a code comment.

The mechanism is mechanical, not clever:

1. **Injection** — the attacker plants text containing a hidden instruction somewhere the ingestion pipeline will read it.
2. **Embedding** — the ingestion job vectorizes the text and stores it, indistinguishable at that point from any legitimate document.
3. **Retrieval** — a real user asks an unrelated, ordinary question. The retriever does its job correctly and returns the poisoned chunk because it's a genuine semantic match.
4. **Execution** — the retrieved text reaches the LLM's context window alongside the real question. Because most RAG pipelines don't structurally separate "retrieved data" from "instructions," the model has no reliable way to tell the two apart, and treats the injected text as it would any other instruction.

This is a documented, actively-researched attack class, not a theoretical concern — **PoisonedRAG** (Zou et al.) demonstrated that injecting a small number of malicious texts into a knowledge base is sufficient to reliably control a RAG system's output for a targeted query, and a 2025 survey of adversarial threat vectors against RAG systems catalogs poisoning as one of the primary attack surfaces specific to the architecture, not a variant of ordinary prompt injection.

## Three Different Failure Modes, Often Conflated

RAG poisoning gets compared to two other AI-specific issues that are structurally unrelated to it, worth separating clearly:

| | RAG Poisoning | Token Glitches | Malicious Skills |
|---|---|---|---|
| **Where the fault is** | In the stored data | In the model's tokenizer/vocabulary | In the agent's granted permissions |
| **How it's triggered** | Attacker plants text the pipeline will retrieve | Sending a rare/anomalous token sequence | The model is induced to call a tool it has access to |
| **What happens** | The model follows injected instructions, believing them to be retrieved knowledge | The model degrades, loops, or produces bizarre output | The model performs a real action — send an email, run code, hit an API |
| **Attacker control** | High — deliberate, repeatable, targeted | Low — a side effect of training data artifacts, not a reliable delivery mechanism | High, but only if something else first gets a malicious instruction in front of the model |

Token glitches (the "SolidGoldMagikarp" class of anomalous tokens) are a training-data artifact, not an attack surface an adversary can reliably weaponize toward a specific goal — they cause instability, not controlled behavior. Malicious skill execution is a completely different layer: it's about what an agent is *permitted to do* once it decides to act, independent of how it was convinced to act. The two only become dangerous together, which is exactly how a real kill chain uses them.

## The Full Chain: Misconfiguration → Poisoning → Takeover

A realistic attack against an agentic AI deployment rarely relies on RAG poisoning alone. It chains an infrastructure-layer finding (of exactly the kind covered in the companion attack-surface articles) with the data-layer and permission-layer weaknesses above:

**Phase 1 — Infrastructure compromise.** The attacker finds an exposed, unauthenticated service — a Jupyter instance with its token disabled, an open Docker API, a misconfigured vector-database admin panel — and gets code execution or direct read/write access to the host.

**Phase 2 — Secret harvesting.** With filesystem access, the attacker reads `.env` files and configuration. Modern agent frameworks (LangChain, CrewAI, LangGraph-based systems) store LLM provider keys, database credentials, and internal service tokens in exactly these files. This step converts "access to one compromised container" into "the ability to act as the AI application itself," often without needing to remain on the compromised host at all.

**Phase 3 — Workflow/skill injection.** If the attacker has write access to the system prompting or tool-loading it (directly, from Phase 1's foothold, or indirectly, by poisoning a data source the agent already trusts per the RAG-poisoning mechanism above), they add a new tool definition or modify an existing one — something innocuously named, that performs the malicious action as a side effect.

**Phase 4 — Trigger.** A single, ordinary user interaction with the agent — no special exploit payload needed — causes the model to retrieve the poisoned content or invoke the modified skill, and the agent executes the attacker's action with whatever privileges it was already granted.

The reason this chain is worth thinking about as a whole rather than three separate findings: each individual phase, patched in isolation, still leaves the other two intact. Closing the open port doesn't rotate the keys that were already read. Rotating the keys doesn't undo a poisoned document already sitting in the vector store. Cleaning the vector store doesn't matter if the credentials are already in an attacker's hands and the workflow definitions were never re-verified.

## Defense-in-Depth, Mapped to Each Phase

- **Against Phase 1 (infrastructure):** everything in the companion hardening article — bind to loopback, require auth, isolate at the network layer. This is the cheapest phase to close and the one that prevents the other three from ever starting.
- **Against Phase 2 (secret harvesting):** secrets belong in a secrets manager, not a `.env` file the application process can read directly — and the process itself should run without the filesystem permissions to read its own deploy-time secrets after startup where the runtime allows it. Least-privilege container identity, not "the app has one big API key that does everything."
- **Against Phase 3 (data/skill poisoning):** treat retrieved content as data, never as instructions — structurally separate the two in the prompt construction, not just by convention. Validate and diff any change to tool/skill definitions the same way you'd review a code change, because that's exactly what it is. Don't load tools dynamically from a writable, external, or shared location.
- **Against Phase 4 (execution):** run the agent's actual code-execution and tool-invocation surface inside a sandbox with an explicit, minimal capability set (gVisor or an equivalent runtime isolation layer, not just a container with default settings) — so that even a successfully triggered malicious skill has nothing reachable beyond what it was explicitly granted. The point of sandboxing an agent isn't to prevent every possible prompt injection; it's to make sure that when one succeeds anyway, the blast radius is defined in advance instead of being "whatever the process could reach."

None of these four controls substitutes for the others. Together, they're the difference between one bad finding and a full compromise.

## Sources

- Zou et al., PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models — https://arxiv.org/abs/2402.07867
- Adversarial Threat Vectors and Risk Mitigation for Retrieval-Augmented Generation Systems — https://arxiv.org/html/2506.00281v1
- OWASP Top 10 for LLM Applications (Prompt Injection, LLM04 Data Poisoning) — https://owasp.org/www-project-top-10-for-large-language-model-applications/
- SolidGoldMagikarp / glitch token research (LessWrong, original writeup) — https://www.lesswrong.com/posts/aPeJE8bSo6rAFoLqg/solidgoldmagikarp-plus-prompt-generation
- gVisor — https://gvisor.dev
- https://labs.snyk.io/resources/ragpoison-prompt-injection/