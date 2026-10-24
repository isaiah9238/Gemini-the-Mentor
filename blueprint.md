# Architectural Blueprint: The Genesis of Machine Cognition

## 1. Overview and Capabilities
"The Genesis of Machine Cognition" is an interactive, publication-grade scientific exploration platform and virtual research laboratory. It bridges the physical reality of electrical currents in silicon, the theoretical foundations of early computer science, the emergent cognitive sparks of modern large language models, and the biophysical frontier of neuromorphic and ionic computing.

### Core Capabilities:
- **Physical Electrical Pathways & Nanoscale Logic**:
  - Photolithography and semiconductor fabrication simulator (sand -> ingot -> slicing -> UV exposure -> etching -> vias -> packaging).
  - Nanoscale transistor gate switch mechanics (0V vs 1.2V, logic gates AND/OR/NOT/NAND/XOR).
  - Silicon lottery binning and IPC vs clock frequency metrics.
  - Digital, Analog, and Mixed-Signal waveform generator.
- **Historical Logical Foundations**:
  - Ada Lovelace & Babbage Analytical Engine (Note A symbolic computation, Note G Bernoulli numbers step-by-step).
  - The Lovelace Test (2001) vs Lady Lovelace's Objection interactive tester.
  - Alan Turing (1950, Mind) Imitation Game interactive arena.
  - Warren McCulloch & Walter Pitts (1943) Neural Logic Sandbox with configurable threshold θ and inhibitory inputs.
  - Dartmouth 1956 timeline, Arthur Samuel checkers ML simulation, Kemeny & Kurtz BASIC legacy to modern Therabot.
- **Emergent Sparks of AGI (Microsoft Research / Bubeck et al. 2023)**:
  - Theory of Mind experiments: Sally-Anne false-belief test (Bob & Alice Dropbox) and Tom & Adam ZURFIN emotional tracking.
  - Physical Commonsense 3D interactive stack simulator (Book + 9 Eggs in 3x3 + Laptop + Bottle + Nail).
  - Kandinsky *Composition 8* vector spatial generator.
  - Autoregressive next-token prediction visualization and commitment bottlenecks.
  - AlphaFold & Levinthal's Paradox interactive 3D protein conformation viewer with pLDDT confidence coloring.
- **Physical Paradox of Scale & Thermodynamics**:
  - The Von Neumann Bottleneck vs IBM NorthPole memory wall simulator ($E \propto L$).
  - Energy and carbon comparison: Training (GPT-3 1,287 MWh) vs human brain (20W / 0.4 kWh).
  - Global water and energy projections (IEA 2026 = Japan, DLC liquid cooling).
  - Landauer's Principle thermodynamic calculator ($Q = k_B T \ln 2$).
- **Neuromorphic & Ionic Frontier**:
  - 3D Neuronal Action Potential & Membrane Biophysics simulator ($-70\text{mV}$, $Na^+/K^+$ pump, 25% probabilistic transmission).
  - Spiking Neural Network (SNN) with Spike-Timing-Dependent Plasticity (STDP).
  - SpinCloud, Texas A&M Super-Turing AI, NbO2 ECRAM, and LLNL ionic computing models.
- **Full-Stack Gemini AI & Integrations**:
  - Multi-turn Gemini chatbot with historical and scientific role switcher.
  - Real-time Google Search grounding using `gemini-3.8-flash`.
  - Deep reasoning using `gemini-4-argon` with high thinking level.
  - Firebase Google Authentication and Firestore persistence for user experiments.
  - Google Drive export integration for saving blueprints and research notes.
- **Dual-Engine File System Explorer**:
  - **Engine A: Lightweight Browser Virtual Explorer**: High-speed sandboxed in-memory + LocalStorage hierarchical file system preloaded with synthesis models, blueprints, simulation JSONs, and CSVs. Complete with search, recursive folders, file creation, deletion, renaming, Markdown live preview, CSV tabular viewer, and JSON/code syntax editor.
  - **Engine B: Native Connected Local Computer Storage**: W3C File System Access API bridge allowing users to select any folder on their computer (`showDirectoryPicker`), read subdirectories recursively, view local files, and write modifications directly to local hard drive using native file streams (`createWritable`). Universal drag-and-drop & folder upload fallback for restricted environments.
- **Cross-App Bridge, Skill Studio, Mind Map & Analytics**:
  - **Cross-App Firestore Search**: Ability to connect to external Firebase applications (including the Agent Skill Registry, Cognitive Graph Engine, and Neural Telemetry Hub) to search collections, query tool registries, and fetch remote skills.
  - **Write Skill Interface**: Complete agent skill authoring environment adhering to the SKILL.md specification. Features visual form inputs, parameter schemas, execution step pipelines, raw markdown view, live validator, VFS export to `/skills`, computer download, and publishing to Firestore shared registries.
  - **Interactive Mind Map**: Visual node-edge graph mapping application core, autonomous skills, persistent databases, and file dependencies with interactive pan, zoom, node detail inspector, and quick launch into editor.
  - **App Analytics Dashboard**: Real-time telemetry monitoring total invocations, 99.4% success rate, latency histograms, token dissipation, edge cache hit ratio, hourly throughput bar chart, skill breakdown distribution, and interactive live execution simulator.

## 2. Project Architecture & Feature Outline
- **Frontend**: React 19 SPA with TypeScript, Tailwind CSS, Lucide icons, Three.js 3D rendering with studio PBR lighting (`ACESFilmicToneMapping`, `RoomEnvironment`), and collapsible bottom HUD.
- **Backend**: Express server running via `server.ts` with `tsx`, proxying `@google/genai` SDK server-side calls, enforcing strict API key security and `User-Agent: aistudio-build`.
- **Database & Auth**: Firebase Authentication with Google Sign-in and Firestore database (`/users/{userId}`, `/users/{userId}/experiments/{experimentId}`, `/users/{userId}/blueprints/{blueprintId}`, `/users/{userId}/connected_apps`, `/users/{userId}/skills`, `/shared_skills/{skillId}`) protected by ABAC security rules.
- **Workspace**: Google Drive integration via OAuth2 (`drive.file` scope) for seamless document export.
- **File System & Cross-App Interop**: Dual-engine storage with pure VFS logic decoupled in `src/logic/fileSystem.ts` and registry logic in `src/logic/crossAppRegistry.ts`.
- **Aesthetic**: Modern "Bold Definition" design system featuring high-contrast typography, deep multi-layer drop shadows, subtle noise texture, and responsive mobile-ready layout.

## 3. Active Implementation Plan (Completed)
1. [✓] Decoupled pure scientific, mathematical, file system, and cross-app logic into `src/logic/*.ts` and verified with 29 deterministic unit tests via `node:test` (`npm test`).
2. [✓] Built full-stack Express server (`server.ts`) with Gemini endpoints (`/api/gemini/chat`, `/api/gemini/search`, `/api/gemini/think`, `/api/gemini/analyze`) and Vite dev middleware.
3. [✓] Implemented Firebase client SDK configuration, ABAC security rules, and Google Drive export service with user confirmation modal.
4. [✓] Created `.idx/mcp.json` with the requested Firebase MCP configuration.
5. [✓] Constructed modular Three.js 3D and interactive exploration modules:
   - Header with Google Auth, Google Drive sync status, module navigation tabs.
   - Module 1: Physical Silicon & Logic Gates (with 3D Wafer/Transistor inspection and photolithography layer pipeline).
   - Module 2: Historical Foundations & McCulloch-Pitts Sandbox (with Bernoulli calculator, Turing Test arena, and Dartmouth timeline).
   - Module 3: Sparks of AGI (Theory of Mind, 3D Egg-Laptop-Bottle-Nail stack, Kandinsky generator, AlphaFold 3D protein viewer).
   - Module 4: Scale Paradox & Thermodynamics (Memory Wall, Landauer limit calculator, carbon/water footprint).
   - Module 5: Neuromorphic & Ionic Biophysics (3D Action Potential membrane, STDP network, commercial frontier).
   - Module 6: Live Gemini Cognitive Lab & Role-playing Chatbot (Search Grounding & Argon High Thinking).
   - Module 7: Saved Experiments & Research Notebook (Firestore synced + Drive Export).
   - Module 8: Dual-Engine File Explorer (Lightweight Browser VFS + Native Computer Local Storage Bridge).
   - Module 9: Cross-App Bridge, Agent Skill Registry, Write Skill Interface, Interactive Mind Map & App Analytics.
6. [✓] Verified clean compilation, zero linter warnings, 29/29 passing unit tests, and Playwright visual browser inspection.

