# Installation (Agent Skills standard, agentskills.io)

- Claude Code: `cp -R skill/figure-html-first .claude/skills/figure-html-first`
- OpenCode: `cp -R skill/figure-html-first .opencode/skills/figure-html-first`
  (name-Frontmatter ist bereits lowercase-kebab)
- Codex/Plugins: den Ordner als `plugins/figure-html-first/skills/...` in ein
  Marketplace-Repo legen und `codex plugin marketplace add <owner>/<repo>`
- Scripts sind relocatable: die Skill-Referenzen nutzen relative Pfade
  (`pipeline/html/`, `pipeline/lint-fig.sh`, `pipeline/render-fig.sh`) —
  beim Installieren die zwei Scripts mitkopieren oder die Pfade im Skill
  an die Ziel-Umgebung anpassen.
