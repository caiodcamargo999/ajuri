"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    Upload, X, Calculator, FileText, Download,
    Trash2, Plus, ChevronDown, ChevronUp, BarChart2,
    AlertCircle, CheckCircle, Clock, TrendingDown, Search, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_KEYWORDS, AnalysisResult, Transaction, DateLayout } from "@/types/calc";
import { CRMClient } from "@/types/crm";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ── helpers ─────────────────────────────────────────────────────────────
function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function exportToExcel(result: AnalysisResult) {
    const data = [
        ["Relatório Ajuri Calc", "", ""],
        ["Cliente:", result.clientName || "Não informado", ""],
        ["Banco:", result.bankName || "Não informado", ""],
        ["Período:", result.period || "Não informado", ""],
        ["", "", ""],
        ["Data", "Descrição", "Valor (R$)"],
        ...result.transactions.map(t => [t.date, t.description, t.value]),
        ["", "", ""],
        ["", "TOTAL DÉBITOS INDEVIDOS", result.totalDebits]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths to make it beautiful
    ws['!cols'] = [
        { wch: 15 }, // Date
        { wch: 60 }, // Description
        { wch: 20 }, // Value
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ajuri Calc");

    const fileName = `ajuri-calc-${result.fileName.replace(/\.pdf$/i, "")}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

const BRAZILIAN_BANKS = [
    { code: "001", name: "Banco do Brasil", fullName: "Banco do Brasil S.A." },
    { code: "237", name: "Bradesco", fullName: "Banco Bradesco S.A." },
    { code: "341", name: "Itaú", fullName: "Itaú Unibanco S.A." },
    { code: "104", name: "Caixa CEF", fullName: "Caixa Econômica Federal" },
    { code: "033", name: "Santander", fullName: "Banco Santander (Brasil) S.A." },
    { code: "260", name: "Nubank", fullName: "Nu Pagamentos S.A. (Nubank)" },
    { code: "077", name: "Banco Inter", fullName: "Banco Inter S.A." },
    { code: "756", name: "Sicoob", fullName: "Bancoob (Sicoob)" },
    { code: "748", name: "Sicredi", fullName: "Banco Cooperativo Sicredi S.A." },
    { code: "041", name: "Banrisul", fullName: "Banco do Estado do Rio Grande do Sul S.A." },
    { code: "422", name: "Banco Safra", fullName: "Banco Safra S.A." },
    { code: "623", name: "Banco Pan", fullName: "Banco Pan S.A." },
    { code: "318", name: "Banco BMG", fullName: "Banco BMG S.A." },
    { code: "655", name: "Banco BV", fullName: "Banco Votorantim S.A. (BV)" },
    { code: "085", name: "Ailos", fullName: "Cooperativa Central Ailos" },
    { code: "070", name: "BRB", fullName: "Banco de Brasília S.A. (BRB)" },
    { code: "003", name: "Banco da Amazônia", fullName: "Banco da Amazônia S.A." },
    { code: "004", name: "Banco do Nordeste", fullName: "Banco do Nordeste do Brasil S.A." },
    { code: "389", name: "Mercantil", fullName: "Banco Mercantil do Brasil S.A." },
    { code: "212", name: "Banco Original", fullName: "Banco Original S.A." },
];

// ── Main Component ───────────────────────────────────────────────────────
export default function AjuriCalcPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [keywords, setKeywords] = useState<string[]>([...DEFAULT_KEYWORDS]);
    const [newKeyword, setNewKeyword] = useState("");
    const [dateLayout, setDateLayout] = useState<DateLayout>("inline");
    const [clientName, setClientName] = useState("");
    const [bankName, setBankName] = useState("");
    const [period, setPeriod] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [showKeywords, setShowKeywords] = useState(false);
    const [logs, setLogs] = useState<AnalysisResult[]>([]);
    const [activeTab, setActiveTab] = useState<"upload" | "logs">("upload");
    const fileRef = useRef<HTMLInputElement>(null);

    // ── CRM Client Search ────────────────────────────────────────────────
    const [crmClients, setCrmClients] = useState<CRMClient[]>([]);
    const [clientSearch, setClientSearch] = useState("");
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const clientInputRef = useRef<HTMLInputElement>(null);

    // ── Bank Search ──────────────────────────────────────────────────────
    const [bankSearch, setBankSearch] = useState("");
    const [showBankDropdown, setShowBankDropdown] = useState(false);

    const filteredBanks = BRAZILIAN_BANKS.filter(b =>
        b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
        b.fullName.toLowerCase().includes(bankSearch.toLowerCase()) ||
        b.code.includes(bankSearch)
    ).slice(0, 8);

    const selectBank = (bank: typeof BRAZILIAN_BANKS[number]) => {
        setBankName(bank.fullName);
        setBankSearch(bank.fullName);
        setShowBankDropdown(false);
    };

    useEffect(() => {
        try {
            const stored = localStorage.getItem("ajuri_crm_clients");
            if (stored) {
                const parsed: CRMClient[] = JSON.parse(stored);
                setCrmClients(parsed);
            }
        } catch {
            // ignore parse errors
        }

        try {
            const storedLogs = localStorage.getItem("ajuri_calc_logs");
            if (storedLogs) {
                setLogs(JSON.parse(storedLogs));
            }
        } catch {
            // ignore parse errors
        }
    }, []);

    const saveLogs = (newLogs: AnalysisResult[]) => {
        setLogs(newLogs);
        localStorage.setItem("ajuri_calc_logs", JSON.stringify(newLogs));
    };

    const deleteLog = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Deseja realmente excluir esta análise do histórico?")) return;
        const updatedLogs = logs.filter(log => log.id !== id);
        saveLogs(updatedLogs);
        if (result?.id === id) {
            setResult(null);
        }
        toast.success("Análise excluída do histórico.");
    };



    const filteredClients = crmClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase())
    ).slice(0, 8);

    const selectClient = (client: CRMClient) => {
        setClientName(client.name);
        setClientSearch(client.name);
        setShowClientDropdown(false);
    };

    // ── File Handling ────────────────────────────────────────────────────
    const handleFile = useCallback((f: File) => {
        if (!f.name.toLowerCase().endsWith(".pdf")) {
            toast.error("Apenas arquivos PDF são suportados.");
            return;
        }
        setFile(f);
        setResult(null);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    // ── Keyword Management ───────────────────────────────────────────────
    const addKeyword = () => {
        const kw = newKeyword.trim().toUpperCase();
        if (!kw) return;
        if (keywords.includes(kw)) {
            toast.warning("Palavra-chave já adicionada.");
            return;
        }
        setKeywords(prev => [...prev, kw]);
        setNewKeyword("");
    };

    const removeKeyword = (kw: string) => {
        setKeywords(prev => prev.filter(k => k !== kw));
    };

    // ── Analysis ─────────────────────────────────────────────────────────
    const handleAnalyze = async () => {
        if (!file) {
            toast.error("Selecione um arquivo PDF primeiro.");
            return;
        }
        if (keywords.length === 0) {
            toast.error("Adicione pelo menos uma palavra-chave para buscar.");
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        try {
            // Use FormData to send the PDF as binary (avoids base64 body size issues)
            const formData = new FormData();
            formData.append("pdf", file);
            formData.append("keywords", JSON.stringify(keywords));
            formData.append("dateLayout", dateLayout);
            formData.append("clientName", clientName);
            formData.append("bankName", bankName);
            formData.append("period", period);

            const response = await fetch("/api/ajuri-calc", {
                method: "POST",
                body: formData,
                // No Content-Type header — browser sets it automatically with boundary for FormData
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `Erro ${response.status} na análise.`);
            }

            const data = await response.json();
            const analysisResult: AnalysisResult = {
                id: generateId(),
                fileName: file.name,
                analyzedAt: new Date().toISOString(),
                clientName: clientName || undefined,
                bankName: bankName || undefined,
                period: period || undefined,
                transactions: data.transactions || [],
                totalDebits: data.totalDebits || 0,
                keywordsUsed: [...keywords],
            };

            setResult(analysisResult);
            const updatedLogs = [analysisResult, ...logs];
            saveLogs(updatedLogs);
            toast.success(`Análise concluída! ${analysisResult.transactions.length} lançamento(s) identificado(s).`);
        } catch (err: any) {
            console.error("[ajuri-calc] Client error:", err);
            toast.error(err.message || "Erro inesperado na análise.");
        } finally {
            setIsAnalyzing(false);
        }
    };


    // ── Render ───────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5" />
                <div className="relative px-6 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <Calculator className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Ajuri Calc</h1>
                            <p className="text-sm text-zinc-500 mt-0.5">Análise automatizada de extratos bancários · Identificação de débitos indevidos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-6">
                {[
                    { id: "upload", label: "Nova Análise", icon: Upload },
                    { id: "logs", label: `Histórico (${logs.length})`, icon: Clock },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id
                            ? "border-orange-400 text-orange-400"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6 max-w-5xl mx-auto">
                {activeTab === "upload" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Config */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Client Info */}
                            <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Dados da Análise</h2>
                                <div className="space-y-3">
                                    {/* Client search with dropdown */}
                                    <div className="relative">
                                        <label className="text-xs text-zinc-500 font-medium mb-1 block">Cliente</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                                            <input
                                                ref={clientInputRef}
                                                type="text"
                                                value={clientSearch}
                                                onChange={e => {
                                                    setClientSearch(e.target.value);
                                                    setClientName(e.target.value);
                                                    setShowClientDropdown(true);
                                                }}
                                                onFocus={() => setShowClientDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
                                                placeholder="Buscar ou digitar cliente..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                                            />
                                            {clientSearch && (
                                                <button
                                                    onClick={() => { setClientSearch(""); setClientName(""); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        {/* Dropdown */}
                                        {showClientDropdown && filteredClients.length > 0 && (
                                            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden">
                                                {filteredClients.map(client => (
                                                    <button
                                                        key={client.id}
                                                        onMouseDown={() => selectClient(client)}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-3.5 h-3.5 text-orange-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">{client.name}</p>
                                                            {client.cpf && <p className="text-xs text-zinc-500 font-mono">{client.cpf}</p>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showClientDropdown && clientSearch.length > 0 && filteredClients.length === 0 && (
                                            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5">
                                                <p className="text-xs text-zinc-500">Nenhum cliente encontrado. O nome digitado será usado.</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Bank search with dropdown */}
                                    <div className="relative">
                                        <label className="text-xs text-zinc-500 font-medium mb-1 block">Banco</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={bankSearch}
                                                onChange={e => {
                                                    setBankSearch(e.target.value);
                                                    setBankName(e.target.value);
                                                    setShowBankDropdown(true);
                                                }}
                                                onFocus={() => setShowBankDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowBankDropdown(false), 150)}
                                                placeholder="Buscar ou digitar banco..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all"
                                            />
                                            {bankSearch && (
                                                <button
                                                    onClick={() => { setBankSearch(""); setBankName(""); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        {/* Dropdown */}
                                        {showBankDropdown && filteredBanks.length > 0 && (
                                            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                                                {filteredBanks.map(bank => (
                                                    <button
                                                        key={bank.code}
                                                        onMouseDown={() => selectBank(bank)}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold text-orange-400">
                                                            {bank.code}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">{bank.fullName}</p>
                                                            <p className="text-xs text-zinc-500 truncate">{bank.name}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showBankDropdown && bankSearch.length > 0 && filteredBanks.length === 0 && (
                                            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5">
                                                <p className="text-xs text-zinc-500">Nenhum banco encontrado. O nome digitado será usado.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 font-medium mb-1 block">Período do Extrato</label>
                                        <div className="relative">
                                            <select
                                                value={period}
                                                onChange={e => setPeriod(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-zinc-900 text-zinc-400">Selecione o ano...</option>
                                                <option value="2026" className="bg-zinc-900 text-white">2026</option>
                                                <option value="2025" className="bg-zinc-900 text-white">2025</option>
                                                <option value="2024" className="bg-zinc-900 text-white">2024</option>
                                                <option value="2023" className="bg-zinc-900 text-white">2023</option>
                                                <option value="2022" className="bg-zinc-900 text-white">2022</option>
                                                <option value="2021" className="bg-zinc-900 text-white">2021</option>
                                                <option value="2020" className="bg-zinc-900 text-white">2020</option>
                                                <option value="2019" className="bg-zinc-900 text-white">2019</option>
                                                <option value="2018" className="bg-zinc-900 text-white">2018</option>
                                                <option value="2017" className="bg-zinc-900 text-white">2017</option>
                                                <option value="2016" className="bg-zinc-900 text-white">2016</option>
                                                <option value="2015" className="bg-zinc-900 text-white">2015</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date Layout */}
                            <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Layout do Extrato</h2>
                                <div className="space-y-2">
                                    {([
                                        { value: "inline", label: "Data na mesma linha", desc: "01/01 TARIFA BANCÁRIA -R$ 12,50" },
                                        { value: "header", label: "Data no cabeçalho", desc: "01/01/2024\n  TARIFA BANCÁRIA -12,50" },
                                    ] as const).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setDateLayout(opt.value)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${dateLayout === opt.value
                                                ? "border-orange-500/50 bg-orange-500/8 text-white"
                                                : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/15"
                                                }`}
                                        >
                                            <div className="text-sm font-semibold mb-1">{opt.label}</div>
                                            <div className="text-xs text-zinc-600 font-mono whitespace-pre-line">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Keywords */}
                            <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                                <button
                                    className="w-full flex items-center justify-between"
                                    onClick={() => setShowKeywords(v => !v)}
                                >
                                    <div>
                                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-left">Palavras-chave</h2>
                                        <p className="text-xs text-zinc-600 mt-0.5">{keywords.length} termos configurados</p>
                                    </div>
                                    {showKeywords ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                                </button>

                                {showKeywords && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newKeyword}
                                                onChange={e => setNewKeyword(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && addKeyword()}
                                                placeholder="Nova palavra-chave..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
                                            />
                                            <button
                                                onClick={addKeyword}
                                                className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                                            {keywords.map(kw => (
                                                <span
                                                    key={kw}
                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-xs text-zinc-300 group"
                                                >
                                                    {kw}
                                                    <button
                                                        onClick={() => removeKeyword(kw)}
                                                        className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Upload + Result */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Upload Area */}
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={onDrop}
                                onClick={() => fileRef.current?.click()}
                                className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center gap-4 text-center ${isDragging
                                    ? "border-orange-400 bg-orange-500/5 scale-[1.01]"
                                    : file
                                        ? "border-emerald-500/40 bg-emerald-500/3"
                                        : "border-white/10 bg-white/2 hover:border-orange-500/30 hover:bg-orange-500/3"
                                    }`}
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={onFileChange}
                                />

                                {file ? (
                                    <>
                                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                            <FileText className="w-10 h-10 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-400 text-lg">{file.name}</p>
                                            <p className="text-sm text-zinc-500 mt-1">{(file.size / 1024).toFixed(1)} KB · Clique para trocar</p>
                                        </div>
                                        <button
                                            onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                                            <Upload className="w-10 h-10 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg">Arraste o extrato aqui</p>
                                            <p className="text-sm text-zinc-500 mt-1">ou clique para selecionar · Formato PDF</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Analyze Button */}
                            <button
                                onClick={handleAnalyze}
                                disabled={!file || isAnalyzing}
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${!file || isAnalyzing
                                    ? "bg-white/5 border border-white/10 text-zinc-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:shadow-[0_0_40px_rgba(249,115,22,0.35)] hover:scale-[1.01] active:scale-[0.99]"
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
                                        Analisando extrato com IA...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="w-5 h-5" />
                                        Analisar Extrato
                                    </>
                                )}
                            </button>

                            {/* Result */}
                            {result && (
                                <AnalysisResultCard 
                                    result={result} 
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── Logs Tab ── */
                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                <div className="p-5 rounded-2xl bg-white/3 border border-white/8">
                                    <Clock className="w-10 h-10 text-zinc-600" />
                                </div>
                                <p className="text-zinc-500 font-medium">Nenhuma análise realizada ainda.</p>
                                <button
                                    onClick={() => setActiveTab("upload")}
                                    className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors"
                                >
                                    Fazer primeira análise →
                                </button>
                            </div>
                        ) : (
                            logs.map(log => (
                                <LogCard 
                                    key={log.id} 
                                    log={log} 
                                    onDelete={deleteLog} 
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────

function AnalysisResultCard({ 
    result 
}: { 
    result: AnalysisResult; 
}) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-transparent overflow-hidden">
            {/* Summary Header */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <TrendingDown className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Resultado da Análise</p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {result.transactions.length} débito(s) identificado(s)
                                {result.clientName ? ` · ${result.clientName}` : ""}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 mb-1">Total de Débitos Indevidos</p>
                        <p className="text-2xl font-black text-orange-400">{formatCurrency(result.totalDebits)}</p>
                    </div>
                </div>

                {/* Metadata & Export Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {result.bankName && (
                            <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                                🏦 {result.bankName}
                            </Badge>
                        )}
                        {result.period && (
                            <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                                📅 {result.period}
                            </Badge>
                        )}
                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {result.keywordsUsed.length} palavras-chave usadas
                        </Badge>
                    </div>

                    {result.transactions.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => exportToExcel(result)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Exportar Excel (.xlsx)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            {result.transactions.length > 0 && (
                <div>
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="w-full flex items-center justify-between px-5 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/3 transition-all"
                    >
                        <span className="font-semibold">Ver lançamentos detalhados</span>
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expanded && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-y border-white/5 bg-white/3">
                                        <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">Data</th>
                                        <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Descrição</th>
                                        <th className="px-5 py-3 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.transactions.map((t, i) => (
                                        <tr key={i} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                                            <td className="px-5 py-3 text-zinc-400 font-mono text-xs whitespace-nowrap">{t.date}</td>
                                            <td className="px-5 py-3 text-zinc-200">{t.description}</td>
                                            <td className="px-5 py-3 text-right text-red-400 font-semibold font-mono whitespace-nowrap">
                                                {formatCurrency(t.value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-orange-500/8 border-t border-orange-500/20">
                                        <td colSpan={2} className="px-5 py-4 font-bold text-zinc-300 text-sm uppercase tracking-wider">
                                            Total de Débitos Indevidos
                                        </td>
                                        <td className="px-5 py-4 text-right font-black text-orange-400 text-base font-mono">
                                            {formatCurrency(result.totalDebits)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {result.transactions.length === 0 && (
                <div className="flex items-center gap-3 p-5 text-zinc-500">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm">Nenhum débito identificado com as palavras-chave configuradas.</p>
                </div>
            )}
        </div>
    );
}

function LogCard({ 
    log, 
    onDelete 
}: { 
    log: AnalysisResult; 
    onDelete: (id: string, e: React.MouseEvent) => void; 
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 cursor-pointer hover:bg-white/3 transition-all gap-4 sm:gap-0"
                onClick={() => setExpanded(v => !v)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <BarChart2 className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">{log.fileName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {formatDate(log.analyzedAt)}
                            {log.clientName ? ` · ${log.clientName}` : ""}
                            {log.bankName ? ` · ${log.bankName}` : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="text-left sm:text-right">
                        <p className="text-xs text-zinc-600 mb-0.5">{log.transactions.length} débito(s)</p>
                        <p className="font-black text-orange-400">{formatCurrency(log.totalDebits)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(log.id, e); }}
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Excluir do histórico"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-white/5">
                    {log.transactions.length > 0 ? (
                        <>
                            <div className="px-5 py-3 bg-white/1 border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
                                <p className="text-xs text-zinc-400">
                                    Palavras-chave: <span className="text-zinc-300 font-mono">{(log.keywordsUsed || []).join(", ") || "Nenhuma"}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportToExcel(log)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/3">
                                            <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">Data</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Descrição</th>
                                            <th className="px-5 py-3 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {log.transactions.map((t, i) => (
                                            <tr key={i} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                                                <td className="px-5 py-3 text-zinc-400 font-mono text-xs whitespace-nowrap">{t.date}</td>
                                                <td className="px-5 py-3 text-zinc-200">{t.description}</td>
                                                <td className="px-5 py-3 text-right text-red-400 font-semibold font-mono whitespace-nowrap">
                                                    {formatCurrency(t.value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-5 border-t border-white/5">
                                <p className="text-sm font-bold text-zinc-400">
                                    Total: <span className="text-orange-400">{formatCurrency(log.totalDebits)}</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="px-5 py-4 text-sm text-zinc-500">Nenhum débito indevido identificado nesta análise.</p>
                    )}
                </div>
            )}
        </div>
    );
}
