# LinkedIn Short-Post — Teaser für den SIEM-SMB-Guide

> **Status:** Entwurf, fertig zur Veröffentlichung (Englisch, LinkedIn Post).
> **Datum:** 9. September 2026.
> **Zweck:** Kurzer Feed-Post, der auf den Hauptartikel verlinkt
> ([2026-09-09-siem-smb-guide-linkedin.md](2026-09-09-siem-smb-guide-linkedin.md)).
> Bild: `titel.svg` (als PNG exportiert) als Post-Bild.

---

You've got logs. You don't have a SIEM.

Most small and mid-sized teams find this out the hard way: a firewall rule here, a dashboard that shows CPU there, a security tool from eighteen months ago nobody remembers configuring — and none of it talks to any of the others. Something almost happens, and you realize nothing would have told you if it had.

So I wrote the un-marketed version of "how do you actually build this":

→ What a SIEM's seven real stages are — and why **normalization** and **attribution**, not detection, are the parts that quietly break at small scale.

→ What each sensor actually does and doesn't see: Suricata on the wire, eBPF (Falco) in the kernel, host agents on the filesystem, firewall logs on what got refused. Vendors bundle these into one pitch — they're four different jobs.

→ The classic Docker gotcha that bites almost everyone: a "blocked" port can still be reachable, because published container ports NAT through a chain most firewall front-ends don't watch.

→ Four real ways to build it, side by side — the open-source stack (Suricata + Falco + Wazuh + OpenSearch), the AWS-native stack (GuardDuty + Security Hub + CloudTrail + Config + Inspector + SageMaker + Security Lake + WAF/Shield, every service explained and linked), a fully managed SaaS path (Datadog/Splunk — and the deploy-per-service + egress-cost reality nobody puts on the pricing page), and a genuinely minimal on-ramp for a three-person team.

→ Where Checkov, WAF, Kafka vs. Redis Streams for log transport, and MLOps-style anomaly detection actually fit — plus the exact end-to-end wiring for AI-assisted threat detection on both AWS (SageMaker → Lambda → Security Hub, Bedrock Agents calling live findings APIs) and on-prem (OpenSearch ML Commons). The one rule that should never bend: an AI finding adds a confidence score to the rule layer, it never replaces it.

Full breakdown, both architectures, the AWS service links, and the honest trade-offs:

🔗 [You Have Logs. You Don’t Have a SIEM. (AWS-Native vs. Open Source): Suricata, eBPF, Firewalls, WAF — and the AWS-vs-Open-Source Question] (Link hier einfügen)

What does your team actually run today — self-hosted, managed, or "we'll get to it"?

#CyberSecurity #SIEM #AWS #OpenSource #DevSecOps #CloudSecurity #MLOps

---

## Veröffentlichungs-Checkliste

- [ ] `titel.svg` → PNG konvertieren (bereits unter `png/titel.png`) und als Post-Bild anhängen
- [ ] Alternativ: `table_mapping.svg` als zweites Bild (die AWS-vs-OSS-Tabelle ist der stärkste Save/Share-Hook)
- [ ] Platzhalter „(Link hier einfügen)" durch die URL des veröffentlichten Artikels ersetzen
- [ ] Erst Artikel veröffentlichen, dann Post — der Link muss live sein
- [ ] Hashtags: 5–7 Stück (LinkedIn-Optimum 3–5, hier bewusst breiter wegen Cross-Audience AWS+OSS)
- [ ] Vor Veröffentlichung: alle sieben Figuren (`titel`, `pipeline`, `stack_oss`, `stack_aws`, `traffic_control`, `mlops_pipeline`, `table_mapping`) als PNG re-exportieren, falls die SVGs seit dem letzten Export nochmal geändert wurden
