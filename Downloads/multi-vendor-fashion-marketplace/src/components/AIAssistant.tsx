import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, ArrowRight, User, Calculator, ArrowUpRight } from "lucide-react";
import { Product } from "../types";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface AIAssistantProps {
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  lang: string;
  t: any;
}

export default function AIAssistant({ onClose, products, onSelectProduct, lang, t }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        text: `### ${t.ai.welcome}\n\n${t.ai.intro}`
      }
    ]);
  }, [lang, t]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Size Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [gender, setGender] = useState("Unisex");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("68");
  const [fitting, setFitting] = useState("Standard");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const finalQuery = textToSend || input;
    if (!finalQuery.trim() && !showCalculator) return;

    const userMsg: Message = { role: "user", text: finalQuery || `Calculate fit profile: ${gender}, ${height}cm, ${weight}kg, ${fitting} fit.` };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const payload: any = {
        prompt: finalQuery,
        history: messages,
        lang: lang,
      };

      if (showCalculator) {
        payload.height = height;
        payload.weight = weight;
        payload.gender = gender;
        payload.fitting = fitting;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
    } catch (err) {
      const errorMsg = lang === "ru" ? "Глубочайшие извинения. Сетевое соединение прервалось. Пожалуйста, попробуйте еще раз." : lang === "uz" ? "Uzr so'raymiz. Aloqa tizimida xatolik yuz berdi. Iltimos, qayta urinib ko'ring." : "Deepest apologies. I encountered a connectivity issue in the luxury matrix. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", text: errorMsg }]);
    } finally {
      setLoading(false);
      if (showCalculator) {
        setShowCalculator(false); // reset calculator toggle after sending
      }
    }
  };

  const handlePresetSelect = (topic: string) => {
    handleSendMessage(topic);
  };

  // Helper to render markdown/bold lines simply
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Check for headings
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-semibold text-amber-500 mt-3 mb-1">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h4 key={i} className="text-md font-medium text-amber-400 mt-2 mb-1">{line.replace("## ", "")}</h4>;
      }
      if (line.startsWith("* **") || line.startsWith("- **")) {
        // bullet with bold keyword
        const clean = line.replace(/^[\s*-]+/, "");
        const match = clean.match(/^\*\*([^*]+)\*\*(.*)/);
        if (match) {
          return (
            <div key={i} className="flex gap-2 text-sm text-gray-300 ml-2 my-1.5 leading-relaxed">
              <span className="text-amber-500 font-bold">•</span>
              <span>
                <strong className="text-amber-300 font-bold">{match[1]}</strong>
                {match[2]}
              </span>
            </div>
          );
        }
      }
      // Check general bold replacement
      let cleanLine = line;
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIdx) {
          parts.push(cleanLine.substring(lastIdx, match.index));
        }
        parts.push(<strong key={match.index} className="text-amber-400 font-bold">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < cleanLine.length) {
        parts.push(cleanLine.substring(lastIdx));
      }

      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <div key={i} className="flex gap-2 text-sm text-gray-300 ml-2 my-1 leading-relaxed">
            <span className="text-amber-500 font-bold">•</span>
            <span>{parts.length > 0 ? parts : line.substring(2)}</span>
          </div>
        );
      }

      return (
        <p key={i} className="text-sm text-gray-300 my-1 leading-relaxed min-h-[4px]">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div id="ai-assistant-panel" className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0d0d0f]/98 border-l border-amber-500/20 backdrop-blur-md shadow-2xl z-55 flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-[#0d0d0f] to-[#1a1813]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-lg text-black animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-md font-semibold tracking-tight text-white font-sans uppercase">Aura Personal Stylist</h2>
            <p className="text-2xs text-amber-500 font-mono tracking-widest">GEMINI AI RECON ENGINE</p>
          </div>
        </div>
        <button 
          id="close-ai-panel"
          onClick={onClose} 
          className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
              m.role === "user" 
                ? "bg-amber-500 text-black" 
                : "bg-white/10 border border-amber-500/20 text-amber-400"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-2xl ${
              m.role === "user" 
                ? "bg-gradient-to-br from-amber-500/25 to-yellow-600/10 text-white rounded-tr-none border border-amber-500/20" 
                : "bg-white/5 border border-white/5 text-gray-200 rounded-tl-none pr-4"
            }`}>
              {renderMessageContent(m.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 animate-spin">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white/5 border border-white/5 text-gray-400 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="text-xs italic">{t.ai.listening}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Helper Preset Buttons */}
      <div className="p-3 bg-white/2 border-t border-white/5 space-y-2">
        <p className="text-2xs text-gray-500 font-mono tracking-wider uppercase px-1">{t.ai.topicsTitle}</p>
        <div className="flex flex-wrap gap-1.5">
          <button 
            id="preset-style-coat"
            onClick={() => handlePresetSelect(t.ai.topic1Query)}
            className="text-2xs bg-white/5 hover:bg-amber-500/10 hover:text-amber-400 text-gray-300 px-2.5 py-1 rounded-full border border-white/5 hover:border-amber-500/30 transition-all font-sans"
          >
            {t.ai.topic1Btn}
          </button>
          <button 
            id="preset-outfit-recom"
            onClick={() => handlePresetSelect(t.ai.topic2Query)}
            className="text-2xs bg-white/5 hover:bg-amber-500/10 hover:text-amber-400 text-gray-300 px-2.5 py-1 rounded-full border border-white/5 hover:border-amber-500/30 transition-all font-sans"
          >
            {t.ai.topic2Btn}
          </button>
          <button 
            id="preset-trends"
            onClick={() => handlePresetSelect(t.ai.topic3Query)}
            className="text-2xs bg-white/5 hover:bg-amber-500/10 hover:text-amber-400 text-gray-300 px-2.5 py-1 rounded-full border border-white/5 hover:border-amber-500/30 transition-all font-sans"
          >
            {t.ai.topic3Btn}
          </button>
          <button 
            id="toggle-sizing-engine"
            onClick={() => setShowCalculator(!showCalculator)}
            className={`text-2xs flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all font-medium font-sans ${
              showCalculator 
                ? "bg-amber-500 text-black border-amber-500" 
                : "bg-[#1c140a]/80 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            <Calculator className="w-3 h-3" />
            {t.ai.sizeCalculator}
          </button>
        </div>
      </div>

      {/* Sizing Calculator Panel */}
      {showCalculator && (
        <div className="p-4 bg-[#14120f] border-t border-amber-500/30 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">{t.ai.calculatorTitle}</span>
            <button onClick={() => setShowCalculator(false)} className="text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-2xs text-gray-400 uppercase mb-1 font-mono">{t.ai.genderFrame}</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#1b1916] border border-amber-500/20 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Male">{lang === "ru" ? "Мужской" : lang === "uz" ? "Erkak" : "Male"}</option>
                <option value="Female">{lang === "ru" ? "Женский" : lang === "uz" ? "Ayol" : "Female"}</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-2xs text-gray-400 uppercase mb-1 font-mono">{t.ai.fitting}</label>
              <select 
                value={fitting} 
                onChange={(e) => setFitting(e.target.value)}
                className="w-full bg-[#1b1916] border border-amber-500/20 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Fitted">{lang === "ru" ? "Приталенный" : lang === "uz" ? "Yopishgan" : "Fitted (Tailored)"}</option>
                <option value="Standard">{lang === "ru" ? "Обычный" : lang === "uz" ? "Standart" : "Standard Fit"}</option>
                <option value="Loose">{lang === "ru" ? "Свободный" : lang === "uz" ? "Keng" : "Oversized (Relaxed)"}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-2xs text-gray-400 uppercase mb-1 font-mono">{t.ai.heightCm}: {height} cm</label>
              <input 
                type="range" 
                min="140" 
                max="210" 
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-2xs text-gray-400 uppercase mb-1 font-mono">{t.ai.weightKg}: {weight} kg</label>
              <input 
                type="range" 
                min="40" 
                max="120" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
          <button 
            id="calculate-size-btn"
            onClick={() => handleSendMessage()}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all font-sans"
          >
            {t.ai.analyzeParams} <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-amber-500/20 bg-[#0d0d0f]">
        <div className="flex gap-2 bg-[#1b1a1c] border border-white/5 focus-within:border-amber-500/50 rounded-2xl p-1.5 transition-all">
          <input 
            id="ai-panel-chat-input"
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t.ai.inputPlaceholder} 
            className="flex-1 bg-transparent border-none outline-none text-xs text-white px-2 focus:ring-0"
          />
          <button 
            id="ai-panel-chat-submit"
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-white/5 disabled:text-gray-600 text-black p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-3xs text-gray-500 mt-2 font-mono text-center">{t.ai.poweredBy}</p>
      </div>
    </div>
  );
}
