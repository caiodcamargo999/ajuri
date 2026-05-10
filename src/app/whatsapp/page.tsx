"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RefreshCw, CheckCircle2, QrCode, ShieldCheck, Zap, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { evolutionService } from "@/utils/evolution";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrandingProfile } from "@/types/petition";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppPage() {
    const [instanceName, setInstanceName] = useState("");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<"open" | "close" | "checking" | null>(null);
    const [loading, setLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const checkStatus = useCallback(async (name: string) => {
        if (!name.trim()) return;
        setIsChecking(true);
        try {
            const res = await evolutionService.getInstanceStatus(name);
            console.log("Status response:", res);
            setStatus(res?.instance?.state === "open" ? "open" : "close");
        } catch (e) {
            console.error("Error checking status:", e);
            setStatus("close");
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        const storedProfiles = localStorage.getItem("ajuri_branding_profiles");
        const activeId = localStorage.getItem("ajuri_active_profile_id");
        if (storedProfiles && activeId) {
            const profiles: BrandingProfile[] = JSON.parse(storedProfiles);
            const active = profiles.find(p => p.id === activeId);
            if (active?.officeData?.waInstanceName) {
                setInstanceName(active.officeData.waInstanceName);
                checkStatus(active.officeData.waInstanceName);
            }
        }
    }, [checkStatus]);

    useEffect(() => {
        // Debug: Check environment variables
        if (!process.env.NEXT_PUBLIC_EVOLUTION_API_URL || !process.env.NEXT_PUBLIC_EVOLUTION_API_KEY) {
            console.error("Missing Evolution API variables!");
            toast.error("Erro de Configuração: API URL ou Key não encontradas no .env");
        }
    }, []);

    // Polling to check status when QR Code is displayed
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (qrCode && status !== "open") {
            interval = setInterval(() => {
                checkStatus(instanceName);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [qrCode, status, instanceName, checkStatus]);

    const handleConnect = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        console.log("Button clicked!");

        if (!instanceName.trim()) {
            toast.error("Digite um nome para sua instância.");
            return;
        }

        const nameRegex = /^[a-zA-Z0-9_]+$/;
        if (!nameRegex.test(instanceName)) {
            toast.error("O nome da instância deve conter apenas letras, números e sublinhados.");
            return;
        }

        setLoading(true);
        setQrCode(null);

        try {
            toast.loading("Iniciando conexão...", { id: "wa-connect" });
            console.log("Checking instance status for:", instanceName);

            let statusRes;
            try {
                statusRes = await evolutionService.getInstanceStatus(instanceName);
                console.log("Status check result:", statusRes);
            } catch (err) {
                console.log("Instance check failed (expected if new):", err);
            }

            if (statusRes?.instance?.state === "open") {
                setStatus("open");
                toast.success("WhatsApp já está conectado!", { id: "wa-connect" });
            } else {
                console.log("Instance not open, trying to get QR or create.");
                try {
                    const qrRes = await evolutionService.getQrCode(instanceName);
                    console.log("QR Code result:", qrRes);

                    if (qrRes?.base64) {
                        setQrCode(qrRes.base64);
                        setStatus("close");
                        toast.success("QR Code gerado com sucesso!", { id: "wa-connect" });
                    } else {
                        throw new Error("QR Code not found in response");
                    }
                } catch (qrErr) {
                    console.log("QR Fetch failed, trying to create instance...", qrErr);
                    toast.loading("Criando nova instância...", { id: "wa-connect" });

                    await evolutionService.createInstance(instanceName);
                    console.log("Instance create request sent.");

                    // Wait a bit for the instance to initialize
                    setTimeout(async () => {
                        try {
                            console.log("Retrying QR Code fetch...");
                            const retryQr = await evolutionService.getQrCode(instanceName);
                            if (retryQr?.base64) {
                                setQrCode(retryQr.base64);
                                toast.success("Instância criada e QR Code pronto!", { id: "wa-connect" });
                            } else {
                                toast.info("Instância criada. Clique em conectar novamente.", { id: "wa-connect" });
                            }
                        } catch (err) {
                            console.error("Retry QR failed:", err);
                            toast.info("Instância criada. Tente conectar novamente em alguns segundos.", { id: "wa-connect" });
                        }
                    }, 3000);
                }
            }

            updateProfileInstance(instanceName);

        } catch (e: any) {
            console.error("Connect error:", e);
            toast.error(`Erro: ${e.message || "Falha na comunicação com a API"}`, { id: "wa-connect" });
        } finally {
            setLoading(false);
        }
    };

    const updateProfileInstance = (name: string) => {
        const storedProfiles = localStorage.getItem("ajuri_branding_profiles");
        const activeId = localStorage.getItem("ajuri_active_profile_id");
        if (storedProfiles && activeId) {
            let profiles: BrandingProfile[] = JSON.parse(storedProfiles);
            profiles = profiles.map(p =>
                p.id === activeId ? { ...p, officeData: { ...p.officeData, waInstanceName: name } } : p
            );
            localStorage.setItem("ajuri_branding_profiles", JSON.stringify(profiles));
        }
    };

    return (
        <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-700 bg-black overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 p-4 md:p-8 h-full relative z-10">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                <FaWhatsapp className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                                    Conexão WhatsApp
                                </h1>
                                <p className="text-zinc-500 text-sm md:text-base font-medium">
                                    Automatize o envio de petições e documentos com a inteligência do AJURI X.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn(
                            "px-4 py-2 rounded-2xl border-white/10 transition-all duration-500 h-12 flex items-center font-bold text-xs uppercase tracking-wider",
                            status === "open"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                : status === "checking"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                                    : "bg-red-500/10 text-red-400 border-red-500/30"
                        )}>
                            <div className={cn(
                                "w-2 h-2 rounded-full mr-3 shadow-[0_0_10px_currentColor]",
                                status === "open" ? "bg-emerald-500" : status === "checking" ? "bg-amber-500" : "bg-red-500"
                            )} />
                            {status === "open" ? "CONECTADO" : status === "checking" ? "VERIFICANDO" : "DESCONECTADO"}
                        </Badge>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => checkStatus(instanceName)}
                            disabled={isChecking || !instanceName}
                            className="h-12 w-12 rounded-2xl bg-zinc-950/50 border-white/5 hover:bg-zinc-800 transition-all"
                        >
                            <RefreshCw className={cn("w-5 h-5", isChecking && "animate-spin")} />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-2">
                        <Card className="lg:col-span-12 xl:col-span-5 border border-white/5 bg-zinc-950/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group rounded-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-emerald-500" />
                                    Instância do Escritório
                                </CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Configure o identificador único para o seu CRM.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="instance-name" className="text-sm font-medium text-zinc-300">
                                            Nome da Instância
                                        </Label>
                                        <div className="relative group/input">
                                            <Input
                                                id="instance-name"
                                                value={instanceName}
                                                onChange={(e) => setInstanceName(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                                                placeholder="ex: silva_advogados"
                                                className="bg-black/40 border-white/5 h-12 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all pl-10"
                                            />
                                            <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600 group-focus-within/input:text-emerald-500 transition-colors" />
                                        </div>
                                        <p className="text-[11px] text-zinc-500 italic px-1">
                                            * Use apenas letras minúsculas, números e sublinhados (_).
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handleConnect}
                                        disabled={loading || !instanceName}
                                        className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all gap-2"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <QrCode className="w-5 h-5" />
                                        )}
                                        {qrCode ? "Regerar QR Code" : "Conectar Novo Aparelho"}
                                    </Button>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        Funcionalidades Ativas
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                        {[
                                            "Envio de PDF direto em um clique",
                                            "Integração com AI para respostas rápidas",
                                            "Sincronização de leads em tempo real",
                                            "Múltiplas instâncias por escritório"
                                        ].map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <span className="text-xs text-zinc-400">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-12 xl:col-span-7 border border-white/5 bg-zinc-950/50 backdrop-blur-xl shadow-2xl flex flex-col min-h-[500px] overflow-hidden rounded-2xl">
                            <CardHeader className="border-b border-white/5 bg-black/20">
                                <CardTitle className="text-center text-zinc-300">Status da Conexão</CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col items-center justify-center p-12 relative">
                                <AnimatePresence mode="wait">
                                    {qrCode ? (
                                        <motion.div
                                            key="qr"
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                            className="flex flex-col items-center"
                                        >
                                            <div className="relative p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] border border-emerald-500/30">
                                                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                                                <div className="absolute -inset-2 border-2 border-emerald-500/20 rounded-[3rem] animate-pulse" />
                                            </div>
                                            <div className="mt-8 space-y-2 text-center">
                                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    Aguardando Escaneamento
                                                </p>
                                                <p className="text-zinc-500 text-sm">Abra o WhatsApp {">"} Aparelhos Conectados</p>
                                            </div>
                                        </motion.div>
                                    ) : status === "open" ? (
                                        <motion.div
                                            key="connected"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-6 text-center"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                                                <div className="relative w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                                                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold text-white">Pronto para o Uso!</h3>
                                                <p className="text-zinc-400 max-w-[300px]">
                                                    Sua conta está integrada com sucesso. O AJURI X agora pode gerenciar suas interações.
                                                </p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 rounded-xl px-6 transition-all"
                                                onClick={async () => {
                                                    if (confirm("Deseja realmente desconectar este aparelho?")) {
                                                        try {
                                                            await evolutionService.logoutInstance(instanceName);
                                                            setStatus("close");
                                                            setQrCode(null);
                                                            toast.info("Aparelho desconectado.");
                                                        } catch (e) {
                                                            toast.error("Erro ao desconectar.");
                                                        }
                                                    }
                                                }}
                                            >
                                                Desconectar Número
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center gap-6 text-center"
                                        >
                                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                                                <QrCode className="w-10 h-10 text-zinc-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-zinc-400 font-medium">Nenhum QR Code Gerado</p>
                                                <p className="text-zinc-600 text-sm">Insira o nome da instância e clique em conectar.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>

                            <div className="p-6 bg-emerald-500/5 border-t border-white/5">
                                <div className="flex items-center gap-3 text-xs text-zinc-500 justify-center">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Conexão segura via Evolution API v2 End-to-End Encryption</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
