# Gemini-SVG-Prompts für den gVisor/VLAN-Layer-Artikel

## SVG 1 — gVisor-Architektur (Sentry/Gofer/Netstack)
"Erstelle ein technisches Diagramm (SVG, dunkles Theme, deutsche Labels) das
gVisors interne Architektur zeigt: Links die App (Container-Prozess), dessen
Syscalls von der Sentry (Userspace-Kernel, orangener Block) abgefangen werden;
oben rechts der Gofer (File-System-Proxy, eigener Prozess) der Datei-Zugriffe
vermittelt; unten die Netstack (Userspace-TCP/IP). Drei Spalten: Container
(App über 9p-FDS/LISTS), Sentry, Host-Kernel — mit Pfeilen: App→Sentry
(Syscall-Intercept), Sentry→Host-Kernel (reduzierte echte Syscalls ~70 statt
300+), Sentry→Gofer (FS-Requests via 9P), Sentry→Netstack (Net-Pakete).
Hinweis-Box: ptrace- vs KVM-Platform. Stil: docs/articles/entropy-cascades/*.svg
(gleiche Farbpalette, gleiche Strichstärke)."

<svg viewBox="0 0 940 580" xmlns="http://w3.org" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <defs>
    <!-- Pfeilspitzen -->
    <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#a1a1aa"/>
    </marker>
    <marker id="arrow-orange" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f97316"/>
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
  </defs>

  <!-- Hintergrund -->
  <rect width="940" height="580" fill="#09090b" rx="8"/>
  <rect x="1" y="1" width="938" height="578" fill="none" stroke="#27272a" stroke-width="2" rx="8"/>

  <!-- Titel / Header -->
  <text x="32" y="38" fill="#f4f4f5" font-size="18" font-weight="700" letter-spacing="-0.025em">gVisor Architektur-Übersicht</text>
  <text x="32" y="58" fill="#a1a1aa" font-size="12">Kapselung von Systemaufrufen durch Sentry, Gofer und Netstack</text>

  <!-- SPALTE 1: Container / App -->
  <rect x="32" y="88" width="220" height="280" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
  <rect x="32" y="88" width="220" height="32" fill="#27272a" rx="6"/>
  <path d="M 32 120 H 252" stroke="#3f3f46" stroke-width="1.5"/>
  <text x="44" y="109" fill="#e4e4e7" font-size="13" font-weight="600">Container-Namespace</text>

  <rect x="52" y="140" width="180" height="208" fill="#09090b" stroke="#52525b" stroke-width="1" rx="4"/>
  <text x="64" y="168" fill="#f4f4f5" font-size="13" font-weight="600">App (Container-Prozess)</text>
  <text x="64" y="192" fill="#a1a1aa" font-size="11">Führt ungefilterten</text>
  <text x="64" y="208" alt="code" fill="#a1a1aa" font-size="11">Anwendungscode aus</text>
  
  <rect x="64" y="232" width="156" height="100" fill="#18181b" stroke="#3f3f46" rx="4"/>
  <text x="76" y="254" fill="#d4d4d8" font-size="11" font-weight="600">Syscall Interface</text>
  <text x="76" y="278" fill="#a1a1aa" font-size="10">Erzeugt reguläre</text>
  <text x="76" y="294" fill="#a1a1aa" font-size="10">Systemaufrufe (300+)</text>


  <!-- SPALTE 2: Sentry (Userspace Kernel) - Zentrum -->
  <rect x="300" y="88" width="340" height="280" fill="#1c130b" stroke="#f97316" stroke-width="2" rx="6"/>
  <rect x="300" y="88" width="340" height="34" fill="#431407" rx="6"/>
  <path d="M 300 122 H 640" stroke="#f97316" stroke-width="1.5"/>
  <text x="316" y="110" fill="#fdba74" font-size="13" font-weight="700">Sentry (Userspace-Kernel)</text>

  <!-- Sentry Sub-Komponenten -->
  <rect x="320" y="140" width="300" height="135" fill="#18110b" stroke="#c2410c" stroke-width="1" rx="4"/>
  <text x="336" y="168" fill="#ffedd5" font-size="12" font-weight="600">Kern-Logik &amp; Virtualisierung</text>
  <text x="336" y="192" fill="#fed7aa" font-size="11">Fängt App-Syscalls ab (Syscall-Intercept)</text>
  <text x="336" y="214" fill="#fed7aa" font-size="11">Emuliert Kernel-Subsysteme im Userspace</text>
  <text x="336" y="236" fill="#fdba74" font-size="10" font-family="monospace">Virtual Memory / Tasks / Signals</text>

  <!-- Netstack (unten in Sentry) -->
  <rect x="320" y="287" width="300" height="65" fill="#082f49" stroke="#0284c7" stroke-width="1" rx="4"/>
  <text x="336" y="312" fill="#bae6fd" font-size="12" font-weight="600">Netstack (Userspace TCP/IP)</text>
  <text x="336" y="332" fill="#e0f2fe" font-size="10">Verarbeitet Netzwerkpakete rein im Userspace</text>


  <!-- SPALTE 3 / OBEN RECHTS: Gofer (File-System-Proxy) -->
  <rect x="680" y="88" width="228" height="128" fill="#18181b" stroke="#38bdf8" stroke-width="1.5" rx="6"/>
  <rect x="680" y="88" width="228" height="32" fill="#082f49" rx="6"/>
  <path d="M 680 120 H 908" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="696" y="109" fill="#e0f2fe" font-size="13" font-weight="600">Gofer (Prozess)</text>
  
  <text x="696" y="148" fill="#f4f4f5" font-size="11" font-weight="600">File-System-Proxy</text>
  <text x="696" y="168" fill="#a1a1aa" font-size="10">Vermittelt Dateizugriffe</text>
  <text x="696" y="184" fill="#a1a1aa" font-size="10">Isoliert den Host vom Dateisystem</text>


  <!-- UNTEN RECHTS: Host-Kernel -->
  <rect x="680" y="248" width="228" height="120" fill="#18181b" stroke="#52525b" stroke-width="1.5" rx="6"/>
  <rect x="680" y="248" width="228" height="32" fill="#27272a" rx="6"/>
  <path d="M 680 280 H 908" stroke="#52525b" stroke-width="1.5"/>
  <text x="696" y="269" fill="#e4e4e7" font-size="13" font-weight="600">Host-Kernel (Linux)</text>
  
  <text x="696" y="306" fill="#f4f4f5" font-size="11" font-weight="600">Reduzierte echte Syscalls</text>
  <text x="696" y="326" fill="#f97316" font-size="11" font-weight="700">~70 statt 300+ Syscalls</text>
  <text x="696" y="346" fill="#a1a1aa" font-size="10">Sicherer Hardware-Zugriff</text>


  <!-- PFEILE & VERBINDUNGEN -->
  
  <!-- App -> Sentry (Syscall-Intercept) -->
  <path d="M 220 282 L 292 282" fill="none" stroke="#f97316" stroke-width="2" marker-end="url(#arrow-orange)"/>
  <rect x="228" y="265" width="58" height="15" fill="#09090b" rx="2"/>
  <text x="231" y="276" fill="#fdba74" font-size="9" font-weight="600">Intercept</text>

  <!-- Sentry -> Host-Kernel -->
  <path d="M 540 368 L 540 410 L 794 410 L 794 374" fill="none" stroke="#a1a1aa" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#arrow)"/>
  <text x="590" y="398" fill="#a1a1aa" font-size="10">Reduzierte echte Syscalls</text>

  <!-- Sentry -> Gofer (FS-Requests via 9P) -->
  <path d="M 640 152 L 672 152" fill="none" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
  <rect x="643" y="137" width="28" height="14" fill="#09090b" rx="2"/>
  <text x="646" y="147" fill="#38bdf8" font-size="9" font-weight="600">9P</text>

  <!-- Sentry / Netstack interne Anbindung / Platzhalter (optionaler visueller Indikator) -->
  <path d="M 470 275 L 470 283" fill="none" stroke="#f97316" stroke-width="1.5"/>


  <!-- HINWEIS-BOX: ptrace vs KVM Platform (Unten links/mitte) -->
  <rect x="32" y="392" width="608" height="156" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
  <rect x="32" y="392" width="608" height="30" fill="#27272a" rx="6"/>
  <path d="M 32 422 H 640" stroke="#3f3f46" stroke-width="1.5"/>
  <text x="48" y="411" fill="#f4f4f5" font-size="12" font-weight="600">Plattform-Backend (Sentry-Ausführungsmodus)</text>
  
  <!-- Ptrace Info -->
  <rect x="48" y="438" width="280" height="94" fill="#09090b" stroke="#52525b" stroke-width="1" rx="4"/>
  <text x="60" y="460" fill="#e4e4e7" font-size="11" font-weight="700">ptrace Platform</text>
  <text x="60" y="480" fill="#a1a1aa" font-size="10">Nutzt ptrace(2) des Host-Kernels,</text>
  <text x="60" y="496" fill="#a1a1aa" font-size="10">um Syscalls abzufangen.</text>
  <text x="60" y="512" fill="#71717a" font-size="9">Kompatibel mit jeder CPU, höherer Overhead.</text>

  <!-- KVM Info -->
  <rect x="344" y="438" width="280" height="94" fill="#09090b" stroke="#52525b" stroke-width="1" rx="4"/>
  <text x="356" y="460" fill="#fdba74" font-size="11" font-weight="700">KVM Platform</text>
  <text x="356" y="480" fill="#a1a1aa" font-size="10">Nutzt Hardware-Virtualisierung</text>
  <text x="356" y="496" fill="#a1a1aa" font-size="10">(KVM) für den Syscall-Intercept.</text>
  <text x="356" y="512" fill="#71717a" font-size="9">Schneller, erfordert /dev/kvm Zugriff.</text>

</svg>

---

## SVG 2 — 3-Layer-Defense (JiMesh-Kontext)
"SVG-Diagramm, drei horizontale Layers mit je einem angreifenden Pfeil der
BLOCKIERT wird: Layer 1 ‚Identity-Routing' (JiMesh-Router/Reverse-Proxy, Port
nie exposed — Angriff: Port-Scan findet nichts), Layer 2 ‚VLAN-Segmentierung'
(macvlan pro Projekt — Angriff: Cross-Tenant-Lateral-Movement blockiert),
Layer 3 ‚gVisor-Sandbox' (Sentry fängt Syscalls — Angriff: Kernel-Escape
blockiert). Rechts jeweils ein grüner Shield-Haken. Unten: ‚Alle drei
zusammen = defense in depth' — JiMesh-Router als Gatekeeper-Ebene ganz außen.
Verweis-Stil an waf_flow.svg aus dem SIEM-Artikel."

<svg viewBox="0 0 960 620" xmlns="http://w3.org" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <defs>
    <!-- Roter Angreifer-Pfeil -->
    <marker id="arrow-attack" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
    </marker>
    <!-- Grüner Haken / Erfolgspfad -->
    <marker id="arrow-success" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e"/>
    </marker>
  </defs>

  <!-- Hintergrund -->
  <rect width="960" height="620" fill="#09090b" rx="8"/>
  <rect x="1" y="1" width="958" height="618" fill="none" stroke="#27272a" stroke-width="2" rx="8"/>

  <!-- Titel / Header -->
  <text x="32" y="38" fill="#f4f4f5" font-size="18" font-weight="700" letter-spacing="-0.025em">Defense in Depth: Multi-Layer-Absicherung</text>
  <text x="32" y="58" fill="#a1a1aa" font-size="12">Effektive Blockade spezifischer Angriffsvektoren auf jeder Architekturebene</text>

  <!-- ANGRIFFS-URSPRUNG (Links) -->
  <text x="32" y="115" fill="#fca5a5" font-size="11" font-weight="700" letter-spacing="0.05em">ANGLEIFER-VEKTOREN</text>

  <!-- ================= LAYER 1: GATEKEEPER-EBENE (GANZ AUẞEN) ================= -->
  <g transform="translate(180, 100)">
    <!-- Layer Box -->
    <rect width="580" height="90" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
    <text x="16" y="28" fill="#e4e4e7" font-size="13" font-weight="700">Layer 1: Identity-Routing</text>
    <text x="16" y="48" fill="#a1a1aa" font-size="11">JiMesh-Router / Reverse-Proxy — Ports werden niemals direkt nach außen exposed</text>
    <text x="16" y="68" fill="#10b981" font-size="11" font-weight="600">✓ Gatekeeper-Ebene ganz außen</text>
    
    <!-- Schild / Status rechts -->
    <g transform="translate(610, 25)">
      <rect width="110" height="40" fill="#064e3b" stroke="#10b981" stroke-width="1" rx="4"/>
      <circle cx="24" cy="20" r="10" fill="#10b981"/>
      <path d="M 19 20 L 23 24 L 30 16" fill="none" stroke="#064e3b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="42" y="24" fill="#a7f3d0" font-size="11" font-weight="700">SICHER</text>
    </g>
  </g>
  
  <!-- Angriff L1: Port-Scan -->
  <path d="M 40 145 H 174" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-attack)"/>
  <!-- Blockade-Barriere L1 -->
  <path d="M 180 120 V 170" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
  <rect x="36" y="152" width="130" height="32" fill="#2d1515" stroke="#f87171" stroke-width="1" rx="4"/>
  <text x="44" y="165" fill="#fca5a5" font-size="10" font-weight="700">Angriff: Port-Scan</text>
  <text x="44" y="177" fill="#fca5a5" font-size="9">Ergebnis: Findet nichts</text>


  <!-- ================= LAYER 2: NETZWERK-SEGMENTIERUNG ================= -->
  <g transform="translate(180, 220)">
    <!-- Layer Box -->
    <rect width="580" height="90" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
    <text x="16" y="28" fill="#e4e4e7" font-size="13" font-weight="700">Layer 2: VLAN-Segmentierung</text>
    <text x="16" y="48" fill="#a1a1aa" font-size="11">Dediziertes macvlan pro Projekt isoliert den Netzwerkverkehr vollständig</text>
    <text x="16" y="68" fill="#38bdf8" font-size="11">Erzwingt strikte logische Mandatentrennung</text>

    <!-- Schild / Status rechts -->
    <g transform="translate(610, 25)">
      <rect width="110" height="40" fill="#064e3b" stroke="#10b981" stroke-width="1" rx="4"/>
      <circle cx="24" cy="20" r="10" fill="#10b981"/>
      <path d="M 19 20 L 23 24 L 30 16" fill="none" stroke="#064e3b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="42" y="24" fill="#a7f3d0" font-size="11" font-weight="700">ISOLIERT</text>
    </g>
  </g>

  <!-- Angriff L2: Lateral Movement -->
  <path d="M 40 265 H 174" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-attack)"/>
  <!-- Blockade-Barriere L2 -->
  <path d="M 180 240 V 290" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
  <rect x="36" y="272" width="130" height="32" fill="#2d1515" stroke="#f87171" stroke-width="1" rx="4"/>
  <text x="44" y="285" fill="#fca5a5" font-size="9" font-weight="700">Cross-Tenant Attack</text>
  <text x="44" y="297" fill="#fca5a5" font-size="9">Ergebnis: Blockiert</text>


  <!-- ================= LAYER 3: KERNEL-SANDBOX ================= -->
  <g transform="translate(180, 340)">
    <!-- Layer Box -->
    <rect width="580" height="90" fill="#1c130b" stroke="#f97316" stroke-width="1.5" rx="6"/>
    <text x="16" y="28" fill="#fdba74" font-size="13" font-weight="700">Layer 3: gVisor-Sandbox</text>
    <text x="16" y="48" fill="#fed7aa" font-size="11">Sentry fängt Systemaufrufe (Syscalls) im Userspace ab</text>
    <text x="16" y="68" fill="#fdba74" font-size="11">Verhindert den direkten Durchgriff auf den echten Linux Host-Kernel</text>

    <!-- Schild / Status rechts -->
    <g transform="translate(610, 25)">
      <rect width="110" height="40" fill="#064e3b" stroke="#10b981" stroke-width="1" rx="4"/>
      <circle cx="24" cy="20" r="10" fill="#10b981"/>
      <path d="M 19 20 L 23 24 L 30 16" fill="none" stroke="#064e3b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="42" y="24" fill="#a7f3d0" font-size="11" font-weight="700">GEKAPSELT</text>
    </g>
  </g>

  <!-- Angriff L3: Kernel-Escape -->
  <path d="M 40 385 H 174" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-attack)"/>
  <!-- Blockade-Barriere L3 -->
  <path d="M 180 360 V 410" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
  <rect x="36" y="392" width="130" height="32" fill="#2d1515" stroke="#f87171" stroke-width="1" rx="4"/>
  <text x="44" y="405" fill="#fca5a5" font-size="10" font-weight="700">Kernel-Escape</text>
  <text x="44" y="417" fill="#fca5a5" font-size="9">Ergebnis: Blockiert</text>


  <!-- Vertikale Legende / Datenfluss-Andeutung im WAF-Stil -->
  <path d="M 720 190 V 220" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-success)"/>
  <path d="M 720 310 V 340" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-success)"/>


  <!-- ================= UNTEN: DEFENSE IN DEPTH FAZIT ================= -->
  <rect x="32" y="485" width="896" height="95" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
  <rect x="32" y="485" width="896" height="30" fill="#27272a" rx="6"/>
  <path d="M 32 515 H 928" stroke="#3f3f46" stroke-width="1.5"/>
  <text x="48" y="504" fill="#f4f4f5" font-size="12" font-weight="600">Sicherheitsprinzip</text>
  
  <text x="48" y="542" fill="#a7f3d0" font-size="13" font-weight="700">Alle drei Layer zusammen = Defense in Depth</text>
  <text x="48" y="562" fill="#a1a1aa" font-size="11">Fällt oder versagt eine Ebene (z.B. durch Zero-Days), fangen die vorgelagerten oder nachgelagerten Schichten den Angreifer zuverlässig ab.</text>

</svg>

--- 

## SVG 3 — Failure-Modes (was jede Layer NICHT schützt)
"SVG mit 3 Spalten (je Layer) und roten Durchbruch-Szenarien: Spalte 1
Identity-Routing: ‚Schützt nicht vor: bösartigem Code IM Workspace' → Pfeil
durch zu Layer 2. Spalte 2 VLAN: ‚Schützt nicht vor: Host-Kernel-Escape'
→ Pfeil durch zu Layer 3. Spalte 3 gVisor: ‚Schützt nicht vor: böswilligem
Outbound-Traffic via erlaubte Verbindungen' → Pfeil zurück zu Layer 1/2
(Egress-Allowlist). Unten: keine einzelne Layer genügt — Kombination nötig."

<svg viewBox="0 0 960 620" xmlns="http://w3.org" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <defs>
    <!-- Rote Pfeilspitze für Durchbrüche -->
    <marker id="arrow-break" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444"/>
    </marker>
    <!-- Graue Pfeilspitze für reguläre Pfade -->
    <marker id="arrow-gray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#a1a1aa"/>
    </marker>
  </defs>

  <!-- Hintergrund -->
  <rect width="960" height="620" fill="#09090b" rx="8"/>
  <rect x="1" y="1" width="958" height="618" fill="none" stroke="#27272a" stroke-width="2" rx="8"/>

  <!-- Titel / Header -->
  <text x="32" y="38" fill="#f4f4f5" font-size="18" font-weight="700" letter-spacing="-0.025em">Grenzen der Isolation: Durchbruch-Szenarien</text>
  <text x="32" y="58" fill="#a1a1aa" font-size="12">Warum kein einzelner Sicherheits-Layer ausreicht (Defense in Depth)</text>

  <!-- ================= SPALTE 1: LAYER 1 (IDENTITY-ROUTING) ================= -->
  <rect x="32" y="95" width="270" height="360" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
  <rect x="32" y="95" width="270" height="34" fill="#27272a" rx="6"/>
  <path d="M 32 129 H 302" stroke="#3f3f46" stroke-width="1.5"/>
  <text x="44" y="116" fill="#e4e4e7" font-size="13" font-weight="600">Spalte 1: Identity-Routing</text>

  <!-- Layer 1 Content Box -->
  <rect x="48" y="145" width="238" height="290" fill="#09090b" stroke="#52525b" stroke-width="1" rx="4"/>
  <text x="60" y="175" fill="#f4f4f5" font-size="13" font-weight="600">Identity &amp; Access Layer</text>
  <text x="60" y="195" fill="#71717a" font-size="11">Validiert Identität und Routen</text>

  <!-- Schwachstelle Box L1 -->
  <rect x="56" y="240" width="222" height="90" fill="#2d1515" stroke="#ef4444" stroke-width="1.5" rx="4"/>
  <text x="66" y="260" fill="#fca5a5" font-size="11" font-weight="700">Schützt nicht vor:</text>
  <text x="66" y="282" fill="#fef2f2" font-size="12" font-weight="600">bösartigem Code</text>
  <text x="66" y="300" fill="#fef2f2" font-size="12" font-weight="600">IM Workspace</text>
  <text x="66" y="318" fill="#fca5a5" font-size="10">Code wird trotz korrekter ID ausgeführt</text>


  <!-- ================= SPALTE 2: LAYER 2 (VLAN) ================= -->
  <rect x="345" y="95" width="270" height="360" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
  <rect x="345" y="95" width="270" height="34" fill="#27272a" rx="6"/>
  <path d="M 345 129 H 615" stroke="#3f3f46" stroke-width="1.5"/>
  <text x="357" y="116" fill="#e4e4e7" font-size="13" font-weight="600">Spalte 2: VLAN</text>

  <!-- Layer 2 Content Box -->
  <rect x="361" y="145" width="238" height="290" fill="#09090b" stroke="#52525b" stroke-width="1" rx="4"/>
  <text x="373" y="175" fill="#f4f4f5" font-size="13" font-weight="600">Netzwerk-Isolation</text>
  <text x="373" y="195" fill="#71717a" font-size="11">Trennt Netze auf Layer 2</text>

  <!-- Schwachstelle Box L2 -->
  <rect x="369" y="240" width="222" height="90" fill="#2d1515" stroke="#ef4444" stroke-width="1.5" rx="4"/>
  <text x="379" y="260" fill="#fca5a5" font-size="11" font-weight="700">Schützt nicht vor:</text>
  <text x="379" y="282" fill="#fef2f2" font-size="12" font-weight="600">Host-Kernel-Escape</text>
  <text x="379" y="306" fill="#fca5a5" font-size="10">Angreifer bricht aus Container aus</text>
  <text x="379" y="318" fill="#fca5a5" font-size="10">und übernimmt den Host-Kernel</text>


  <!-- ================= SPALTE 3: LAYER 3 (GVISOR) ================= -->
  <rect x="658" y="95" width="270" height="360" fill="#1c130b" stroke="#f97316" stroke-width="1.5" rx="6"/>
  <rect x="658" y="95" width="270" height="34" fill="#431407" rx="6"/>
  <path d="M 658 129 H 928" stroke="#f97316" stroke-width="1.5"/>
  <text x="670" y="116" fill="#fdba74" font-size="13" font-weight="600">Spalte 3: gVisor</text>

  <!-- Layer 3 Content Box -->
  <rect x="674" y="145" width="238" height="290" fill="#09090b" stroke="#c2410c" stroke-width="1" rx="4"/>
  <text x="686" y="175" fill="#ffedd5" font-size="13" font-weight="600">Kernel-Sandbox Layer</text>
  <text x="686" y="195" fill="#fed7aa" font-size="11">Intercepted Systemaufrufe</text>

  <!-- Schwachstelle Box L3 -->
  <rect x="682" y="240" width="222" height="90" fill="#2d1515" stroke="#ef4444" stroke-width="1.5" rx="4"/>
  <text x="692" y="254" fill="#fca5a5" font-size="11" font-weight="700">Schützt nicht vor:</text>
  <text x="692" y="274" fill="#fef2f2" font-size="12" font-weight="600">böswilligem Outbound-Traffic</text>
  <text x="692" y="292" fill="#fef2f2" font-size="12" font-weight="600">via erlaubte Verbindungen</text>
  <text x="692" y="312" fill="#fca5a5" font-size="10">Datenabfluss trotz Sandbox</text>


  <!-- ================= DURCHBRUCH-PFEILE ================= -->

  <!-- Pfeil 1: Von L1 zu L2 (Schadcode bricht durch) -->
  <path d="M 278 285 L 369 285" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-break)"/>
  
  <!-- Pfeil 2: Von L2 zu L3 (Host-Escape bricht durch) -->
  <path d="M 591 285 L 682 285" fill="none" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-break)"/>

  <!-- Pfeil 3: Von L3 zurück zu L1/L2 (Outbound-Traffic umgeht Sandbox) -->
  <!-- Führt oben herum zurück, um die Kette visuell zu schließen -->
  <path d="M 793 240 L 793 175 L 200 175 L 200 240" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4 4" marker-end="url(#arrow-break)"/>
  
  <!-- Label für Rückführungspfad -->
  <rect x="420" y="158" width="120" height="34" fill="#09090b" stroke="#ef4444" stroke-width="1" rx="4"/>
  <text x="430" y="172" fill="#fca5a5" font-size="10" font-weight="700">Egress-Allowlist</text>
  <text x="430" y="186" fill="#a1a1aa" font-size="9">wird zwingend benötigt</text>


  <!-- ================= UNTEN: SCHLUSSFOLGERUNG / HINWEIS-BOX ================= -->
  <rect x="32" y="485" width="896" height="95" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" rx="6"/>
  <rect x="32" y="485" width="896" height="30" fill="#27272a" rx="6"/>
  <path d="M 32 515 H 928" stroke="#3f3f46" stroke-width="1.5"/>
  <text x="48" y="504" fill="#f4f4f5" font-size="12" font-weight="600">Sicherheitsarchitektur: Fazit</text>
  
  <text x="48" y="542" fill="#fca5a5" font-size="13" font-weight="700">Keine einzelne Ebene genügt — Eine lückenlose Kombination ist zwingend nötig.</text>
  <text x="48" y="562" fill="#a1a1aa" font-size="11">Erst das Zusammenspiel aus starker Identitätsprüfung (L1), Netzwerkisolation (L2) und Kernel-Sandboxing (L3) schließt die Vektoren.</text>

</svg>
