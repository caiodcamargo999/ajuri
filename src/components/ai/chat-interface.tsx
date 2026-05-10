"use client"

import { useChat } from "ai/react"
import { Send, RotateCcw, Paperclip, Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
} from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { Orb } from "@/components/ui/orb"
import { Response } from "@/components/ui/response"
import * as React from "react"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { CRMClient } from "@/types/crm"
import { toast } from "sonner"
import { evolutionService } from "@/utils/evolution" // Import Evolution Service

export function ChatInterface() {
    const router = useRouter()
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput, append } = useChat({
        onFinish: async (message) => { // Make onFinish async
            console.log("=== AJURI AI EXECUTION ===");
            console.log("Message Content:", message.content);

            let toolCalls = message.tool_calls;

            // Robust Parser
            if (!toolCalls || toolCalls.length === 0) {
                if (message.content.includes('"tool_calls"') || message.content.includes('"function"')) {
                    try {
                        const jsonMatch = message.content.match(/\{[\s\S]*"tool_calls"[\s\S]*\}/) ||
                            message.content.match(/\{[\s\S]*"function"[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            toolCalls = parsed.tool_calls || [parsed];
                        }
                    } catch (e) {
                        console.error("Manual JSON parse failed", e);
                    }
                }
            }

            if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
                for (const toolCall of toolCalls) { // Use for...of to allow await inside loop if needed
                    const functionName = (toolCall as any).function?.name || (toolCall as any).name;
                    const functionArgs = (toolCall as any).function?.arguments || (toolCall as any).arguments;

                    if (!functionName || !functionArgs) continue;

                    console.log(`Executing tool: ${functionName}`, functionArgs);
                    const args = typeof functionArgs === 'string' ? JSON.parse(functionArgs) : functionArgs;

                    if (functionName === 'navigate_to') {
                        try {
                            const { page } = args;
                            const routes: Record<string, string> = {
                                'dashboard': '/dashboard',
                                'clientes': '/clientes',
                                'peticoes': '/peticoes',
                                'integracoes': '/integracoes',
                                'processos': '/processos',
                                'customizar': '/customizar-documentacao',
                                'ajuri_x': '/ajuri-x',
                                'agente': '/assistentes-ia'
                            };
                            if (routes[page]) {
                                toast.success(`Navegando para ${page}...`);
                                router.push(routes[page]);
                            }
                        } catch (e) {
                            console.error("Navigation tool failed", e);
                        }
                    }

                    if (functionName === 'register_crm_client') {
                        try {
                            const STORAGE_KEY = "ajuri_crm_clients";
                            const stored = localStorage.getItem(STORAGE_KEY);
                            let clients: CRMClient[] = stored ? JSON.parse(stored) : [];

                            const exists = clients.some(c => c.name.toLowerCase() === args.name.toLowerCase());
                            if (exists && !confirm(`Já existe um lead chamado ${args.name}. Deseja cadastrar novamente?`)) {
                                continue;
                            }

                            const newClient: CRMClient = {
                                id: crypto.randomUUID(),
                                name: args.name,
                                email: args.email || "",
                                phone: args.phone || "",
                                status: "NOVO",
                                cpf: args.cpf || "",
                                notes: args.obs || "Cadastrado via Agente IA",
                                createdAt: new Date().toISOString(),
                                lastUpdate: new Date().toISOString(),
                                processCount: 0,
                                activities: [{
                                    id: crypto.randomUUID(),
                                    type: "SYSTEM",
                                    content: `Lead cadastrado via Agente Ajuri X: ${args.obs || "Sem observações"}`,
                                    timestamp: new Date().toISOString()
                                }],
                                tasks: [],
                            };

                            clients = [newClient, ...clients];
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
                            toast.success(`Lead ${args.name} criado com sucesso! ✨`);

                            if (window.location.pathname === '/clientes') {
                                window.dispatchEvent(new Event('storage'));
                            }
                        } catch (e) {
                            console.error("CRM tool error", e);
                            toast.error("Erro ao cadastrar lead via IA.");
                        }
                    }

                    if (functionName === 'send_whatsapp_message') {
                        try {
                            // 1. Get Active Instance Name
                            const STORAGE_KEYS = { PROFILES: "ajuri_branding_profiles", ACTIVE_ID: "ajuri_active_profile_id" };
                            const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
                            const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);

                            let instanceNameToUse: string | null = null;

                            if (storedProfiles && activeId) {
                                const profiles = JSON.parse(storedProfiles);
                                const activeProfile = profiles.find((p: any) => p.id === activeId);
                                if (activeProfile?.officeData?.waInstanceName) {
                                    instanceNameToUse = activeProfile.officeData.waInstanceName;
                                }
                            }

                            if (!instanceNameToUse) {
                                console.warn("No active WhatsApp instance found in profile. Trying fallback.");
                                // Fallback or handle error
                                // But if user hasn't configured it, we can't send.
                                // toast.error("Instância do WhatsApp não configurada.");
                                // Continue anyway, allowing evolutionService to try its default (env var)
                            }

                            toast.loading("Enviando mensagem WhatsApp...", { id: "sending-wa" });

                            await evolutionService.sendMessage(args.phone, args.message, {
                                instanceName: instanceNameToUse || undefined
                            });

                            toast.dismiss("sending-wa");
                            toast.success(`Mensagem enviada para ${args.phone}! 📱`);

                        } catch (e) {
                            console.error("WhatsApp tool error", e);
                            toast.dismiss("sending-wa");
                            toast.error("Falha ao enviar mensagem WhatsApp.");
                        }
                    }
                }
            }
        }
    })
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = React.useState<FileList | null>(null)

    // Voice Recording State
    const [isRecording, setIsRecording] = React.useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })

                // Create file from blob
                const file = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' })

                const formData = new FormData()
                formData.append('file', file)

                try {
                    // Show some visual feedback that we are processing (optional improvement)
                    const response = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData,
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.text) {
                            // Automatically append to chat for execution
                            append({
                                role: 'user',
                                content: data.text
                            });
                        }
                    }
                } catch (error) {
                    console.error("Transcription failed", error)
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (err) {
            console.error("Error accessing microphone:", err)
            alert("Erro ao acessar microfone. Verifique suas permissões.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files)
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        let attachments = files;

        if (files && files.length > 0) {
            // Upload to Brain (Knowledge Base)
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('file', file);
            });

            try {
                // We utilize the new RAG upload endpoint
                // Note: For multiple files, we might need to loop or adjust the API to accept multiple
                // For MVP, sending the first one or looping here is fine.
                // Let's send the first one as primary context for now.
                const file = files[0];
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('type', 'user_upload');

                // Fire and forget upload to Brain (or await if critical)
                // Awaiting ensures AI has it in vector DB before answering
                await fetch('/api/brain/upload', {
                    method: 'POST',
                    body: uploadData
                });

            } catch (err) {
                console.error("Failed to upload to brain:", err);
            }
        }

        if (!files && !input.trim()) return;

        handleSubmit(e, {
            experimental_attachments: attachments || undefined,
        })
        setFiles(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <Card className="flex flex-col h-full border-none shadow-none bg-transparent">
            <Conversation className="bg-background/50 rounded-xl border overflow-hidden">
                <ConversationContent ref={scrollRef} className="p-6">
                    {messages.length === 0 ? (
                        <ConversationEmptyState
                            icon={<Orb className="size-16" />}
                            title="Agente Ajuri X"
                            description="Eu analiso documentos e crio peças jurídicas para você. Anexe um arquivo e me diga o que fazer."
                        />
                    ) : (
                        <>
                            {messages.map((message) => (
                                <Message from={message.role === 'user' ? 'user' : 'assistant'} key={message.id}>
                                    <MessageContent className={cn(
                                        "max-w-[85%] min-w-[50px] min-h-[40px] flex flex-col justify-center",
                                        message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                                    )}>
                                        {/* Show message content. If it's a tool call JSON, show a cleaner placeholder */}
                                        {message.content && (
                                            message.content.startsWith('{') ? (
                                                <div className="flex items-center gap-2 text-xs opacity-70 italic py-1">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    Processando comando inteligente...
                                                </div>
                                            ) : (
                                                <Response>{message.content}</Response>
                                            )
                                        )}

                                        {/* If tool_calls field is present, show status */}
                                        {((message as any).tool_calls?.length > 0 || (message as any).toolInvocations?.length > 0) && (
                                            <div className="flex items-center gap-2 text-xs opacity-70 italic py-1 border-t border-border/10 mt-1">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                Executando ação: {(message as any).tool_calls?.[0]?.function?.name || "comando"}
                                            </div>
                                        )}

                                        {!message.content && !((message as any).tool_calls?.length > 0) && (
                                            <div className="flex gap-1 items-center h-6 opacity-40">
                                                <span className="w-1 h-1 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1 h-1 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1 h-1 bg-foreground rounded-full animate-bounce"></span>
                                            </div>
                                        )}
                                        {message.experimental_attachments && message.experimental_attachments.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {message.experimental_attachments.map((att, i) => (
                                                    <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden bg-background/20 border border-white/20">
                                                        {att.contentType?.startsWith('image') ? (
                                                            <img src={att.url} alt="att" className="object-cover w-full h-full" />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full text-[10px] p-1 text-center font-mono break-all leading-tight">
                                                                {att.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </MessageContent>
                                    {message.role === "assistant" && (
                                        <div className="ring-border size-8 overflow-hidden rounded-full ring-1 shrink-0">
                                            <Orb className="h-full w-full" agentState="idle" />
                                        </div>
                                    )}
                                </Message>
                            ))}

                            {isLoading && (
                                <Message from="assistant">
                                    <MessageContent className="bg-muted">
                                        <div className="flex gap-1 items-center h-6">
                                            <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"></span>
                                        </div>
                                    </MessageContent>
                                    <div className="ring-border size-8 overflow-hidden rounded-full ring-1 shrink-0">
                                        <Orb className="h-full w-full" agentState="talking" />
                                    </div>
                                </Message>
                            )}
                        </>
                    )}
                </ConversationContent>

                <div className="p-4 bg-background border-t">
                    {files && files.length > 0 && (
                        <div className="flex gap-2 mb-2 px-1 overflow-x-auto pb-2">
                            {Array.from(files).map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-xs relative group border border-border">
                                    <span className="max-w-[150px] truncate font-medium">{file.name}</span>
                                    <button
                                        onClick={() => {
                                            setFiles(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        type="button"
                                        className="ml-1 hover:text-destructive flex items-center justify-center w-4 h-4 rounded-full"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={onSubmit} className="flex gap-2 relative items-end">
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*,.pdf,.txt,.docx"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>

                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Anexe um documento e diga o que fazer..."
                            className="flex-1 h-10 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all min-h-[40px] py-2"
                        />

                        <Button
                            type="button"
                            size="icon"
                            variant={isRecording ? "destructive" : "secondary"}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={cn("h-10 w-10 rounded-full shrink-0 transition-all duration-300", isRecording && "bg-red-500 text-white hover:bg-red-600")}
                        >
                            {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
                            <span className="sr-only">{isRecording ? "Parar Gravação" : "Gravar Áudio"}</span>
                        </Button>

                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || (!input.trim() && (!files || files.length === 0))}
                            className="h-10 w-10 rounded-full shrink-0"
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </form>
                    <div className="flex justify-center mt-2">
                        <button onClick={() => setMessages([])} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                            <RotateCcw className="w-3 h-3" /> Limpar conversa
                        </button>
                    </div>
                </div>
            </Conversation>
        </Card>
    )
}
