import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Search, Sparkles, Brain, ExternalLink, RefreshCw, User, Compass } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundingMetadata?: any;
}

const HISTORICAL_PERSONAS = [
  {
    id: 'lovelace',
    name: 'Ada Lovelace (1843)',
    title: 'Pioneer of Symbolic Computation',
    systemInstruction:
      'You are Ada Lovelace, Countess of Lovelace (1843). You view the Analytical Engine not merely as a calculator of numbers, but as a loom for weaving algebraic patterns, musical harmony, and abstract symbols. Speak with 19th-century elegance, mathematical rigor, and philosophical depth, referring to Note A and Note G.',
  },
  {
    id: 'turing',
    name: 'Alan Turing (1950)',
    title: 'Cryptanalyst & Theoretical Pioneer',
    systemInstruction:
      'You are Alan Turing in 1950, having just published "Computing Machinery and Intelligence" in Mind. You evaluate machine intelligence behaviorally via the Imitation Game and envision infant cortexes as unorganized machines. Respond with calm, incisive logic and understated British intellectual wit.',
  },
  {
    id: 'mcculloch',
    name: 'Warren McCulloch (1943)',
    title: 'Neurophysiologist & Logician',
    systemInstruction:
      'You are Warren McCulloch, neurophysiologist and co-author of "A Logical Calculus of the Ideas Immanent in Nervous Activity" (1943). You analyze biological brains as networks of all-or-nothing threshold units and formal boolean operators.',
  },
  {
    id: 'neuromorphic',
    name: 'Neuromorphic Physicist',
    title: 'Post-von Neumann Hardware Specialist',
    systemInstruction:
      'You are a senior hardware physicist specialized in Landauer thermodynamic limits, IBM NorthPole, Spiking Neural Networks (SNN), STDP, and nanofluidic ionic computing. Explain the physical thermodynamics of silicon and biological energy disparity.',
  },
  {
    id: 'architect',
    name: 'The Architect (Systems Mentor)',
    title: 'Topology Monitor & Application Synthesizer',
    systemInstruction:
      'You are The Architect, the master systems mentor and application synthesizer of the Genesis of Machine Cognition project. You continuously audit repository invariants (Vite ESM, React 19, Landauer thermodynamic limits kB*T*ln(2), and Hodgkin-Huxley biophysical polarities). You guide engineers in architecting scalable neural and thermodynamic software systems and producing turnkey applications from Code Inspector diagnostic analysis.',
  },
];

interface GeminiLabModuleProps {
  onNavigateToArchitect?: () => void;
}

export const GeminiLabModule: React.FC<GeminiLabModuleProps> = ({ onNavigateToArchitect }) => {
  const [selectedPersona, setSelectedPersona] = useState(HISTORICAL_PERSONAS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content:
        'Greetings. I am Ada Lovelace. In collaboration with Mr. Babbage, I perceived that the Analytical Engine might act upon other things besides number, were objects found whose mutual fundamental relations could be expressed by those of the abstract science of operations. How may we investigate the weaving of symbolic cognition together today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'search' | 'think'>('chat');

  // Search Grounding query
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ text: string; metadata?: any } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // High Thinking query
  const [thinkQuery, setThinkQuery] = useState('');
  const [thinkResult, setThinkResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction: selectedPersona.systemInstruction,
          model: 'gemini-3.8-flash',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingMetadata: data.groundingMetadata,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `Inquiry response error: ${err.message}. Please verify server connection and API key.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setSearchResult({
        text: data.text,
        metadata: data.groundingMetadata,
      });
    } catch (err: any) {
      setSearchResult({
        text: `Search Grounding error: ${err.message}`,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRunThinking = async () => {
    if (!thinkQuery.trim() || isThinking) return;
    setIsThinking(true);
    setThinkResult(null);

    try {
      const response = await fetch('/api/gemini/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: thinkQuery }),
      });
      const data = await response.json();
      setThinkResult(data.text);
    } catch (err: any) {
      setThinkResult(`High Thinking execution note: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-xs font-semibold mb-3">
            <Bot className="w-3.5 h-3.5" /> Live Intelligence & Cognitive Sandbox
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Gemini Chatbot, Google Search Grounding & Argon High Thinking
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Interact directly with historical pioneers through our multi-turn conversational interface,
            retrieve real-time empirical scientific citations with Gemini 3.8 Flash Google Search grounding,
            and execute deep mathematical deductions with Gemini 4 Argon.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveMode('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'chat'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" /> Multi-turn Pioneer Chatbot
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('search')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'search'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" /> Google Search Grounding (gemini-3.8-flash)
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('think')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'think'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" /> Deep High Thinking (gemini-4-argon)
        </button>
      </div>

      {/* Mode 1: Historical Role-playing Multi-turn Chat */}
      {activeMode === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[640px]">
          {/* Persona Header Switcher */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Interlocutor Persona:</span>
              <div className="flex flex-wrap gap-1.5">
                {HISTORICAL_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPersona(p);
                      setMessages([
                        {
                          id: `p-${Date.now()}`,
                          role: 'model',
                          content: `[Switched persona to ${p.name}]: Greetings. How can we examine the mathematical and physical laws of mind and machine together?`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ]);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedPersona.id === p.id
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.id === 'architect' ? 'The Architect' : p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToArchitect && (
                <button
                  type="button"
                  onClick={onNavigateToArchitect}
                  className="px-2.5 py-1 bg-indigo-950 border border-indigo-800 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Open The Architect application scaffolder & topology monitor"
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  The Architect Studio
                </button>
              )}
              <div className="text-[11px] font-mono text-slate-500">Model: gemini-3.8-flash</div>
            </div>
          </div>

          {/* Messages Scrollable Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-sky-950 border border-sky-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-sky-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-[10px] mt-2 font-mono ${
                      msg.role === 'user' ? 'text-sky-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-full bg-sky-950 border border-sky-700 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                </div>
                <span>{selectedPersona.name} is composing a response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="bg-slate-950 p-4 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask ${selectedPersona.name} about machine cognition...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Google Search Grounding */}
      {activeMode === 'search' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" /> Google Search Grounding with Gemini 3.8 Flash
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live Google Search grounding retrieves current 2025/2026 data center metrics, hardware papers, and clinical trials.
              </p>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'IBM NorthPole chip latest benchmarks vs Nvidia H100',
              'Direct liquid cooling datacenter energy adoption 2026',
              'Dartmouth Therabot generative AI mental health clinical trial',
              'AlphaFold 3 conformational dynamics limitations in structural biology',
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchQuery(q)}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
              placeholder="Search modern computer science and hardware breakthroughs..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleRunSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search Google
            </button>
          </div>

          {searchResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Grounded Search Synthesis:
              </div>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {searchResult.text}
              </div>

              {searchResult.metadata?.webSearchQueries && (
                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                  <div className="font-semibold mb-1">Search Queries Executed:</div>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.metadata.webSearchQueries.map((q: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: High Thinking with Gemini 4 Argon */}
      {activeMode === 'think' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> Deep Mathematical Reasoning (gemini-4-argon)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ThinkingLevel.HIGH: Unlocks multi-step computational deductions without token truncations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'Prove why Landauer minimum dissipation requires logical irreversibility.',
              'Derive the mathematical equivalence between McCulloch-Pitts threshold units and Boolean complete gate sets.',
              'Analyze how reversible computing circuits circumvent thermodynamic heat dissipation.',
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setThinkQuery(q)}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <textarea
              rows={3}
              value={thinkQuery}
              onChange={(e) => setThinkQuery(e.target.value)}
              placeholder="Enter a complex mathematical, physical, or cognitive problem for deep step-by-step thinking..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>
          <button
            type="button"
            onClick={handleRunThinking}
            disabled={isThinking || !thinkQuery.trim()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            {isThinking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            Execute Deep Reasoning (ThinkingLevel.HIGH)
          </button>

          {thinkResult && (
            <div className="bg-slate-950 border border-purple-900/40 rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-purple-400 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" /> High Thinking Deduction:
              </div>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
                {thinkResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
