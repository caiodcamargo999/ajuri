import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap, Webhook, Key, Terminal, ArrowRight, CheckCircle2, AlertTriangle, Code2, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IntegracoesDocsPage() {
    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1200px] mx-auto w-full animate-in fade-in duration-700 pb-20">
            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <Zap className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">
                            Documentação de Integrações
                        </h1>
                        <p className="text-zinc-500 text-lg mt-1">
                            Guia completo para conectar o AJURI CRM com outras ferramentas.
                        </p>
                    </div>
                </div>
            </header>

            <Tabs defaultValue="webhooks" className="space-y-8">
                <TabsList className="bg-zinc-950/50 border border-white/5 p-1 h-auto rounded-xl">
                    <TabsTrigger value="webhooks" className="gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold transition-all">
                        <Webhook className="w-4 h-4" /> Webhooks
                    </TabsTrigger>
                    <TabsTrigger value="api" className="gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold transition-all">
                        <Key className="w-4 h-4" /> API Key
                    </TabsTrigger>
                </TabsList>

                {/* --- WEBHOOKS --- */}
                <TabsContent value="webhooks" className="space-y-8 animate-in slide-in-from-bottom-2">
                    <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Webhook className="w-5 h-5 text-amber-500" />
                                Como funcionam os Webhooks?
                            </CardTitle>
                            <CardDescription>
                                Webhooks permitem que o AJURI envie dados automaticamente para outras aplicações (como Zapier, n8n, ActiveCampaign) sempre que um evento ocorrer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-2">
                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-white">1. Configure</h3>
                                    <p className="text-sm text-zinc-500">Crie uma URL de destino (Endpoint) na sua ferramenta de automação.</p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-2">
                                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 mb-2">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-white">2. Conecte</h3>
                                    <p className="text-sm text-zinc-500">No AJURI, vá em Clientes &gt; Integrações e cole a URL.</p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-2">
                                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 mb-2">
                                        <Terminal className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-white">3. Receba</h3>
                                    <p className="text-sm text-zinc-500">O sistema enviará um JSON com os dados do cliente instantaneamente.</p>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Code2 className="w-5 h-5 text-zinc-500" />
                                    Exemplos de Payload (JSON)
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/5">EVENTO: NOVO LEAD (CLIENT_CREATED)</Badge>
                                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-zinc-300 overflow-x-auto relative group">
                                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <pre>{JSON.stringify({
                                                "event": "CLIENT_CREATED",
                                                "timestamp": "2024-02-18T14:30:00.000Z",
                                                "data": {
                                                    "id": "uuid-do-cliente",
                                                    "name": "João da Silva",
                                                    "email": "joao@email.com",
                                                    "phone": "5511999999999",
                                                    "cpf": "123.456.789-00",
                                                    "status": "NOVO",
                                                    "pipelineId": "default",
                                                    "origin": "AJURI_X_FORM"
                                                }
                                            }, null, 4)}</pre>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-500/5">EVENTO: ATUALIZAÇÃO DE STATUS (STATUS_CHANGED)</Badge>
                                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-zinc-300 overflow-x-auto">
                                            <pre>{JSON.stringify({
                                                "event": "STATUS_CHANGED",
                                                "timestamp": "2024-02-18T15:00:00.000Z",
                                                "data": {
                                                    "id": "uuid-do-cliente",
                                                    "name": "João da Silva",
                                                    "oldStatus": "NOVO",
                                                    "newStatus": "QUALIFICACAO",
                                                    "pipelineId": "default"
                                                }
                                            }, null, 4)}</pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- API KEY --- */}
                <TabsContent value="api" className="space-y-8 animate-in slide-in-from-bottom-2">
                    <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-500" />
                                Chaves de API
                            </CardTitle>
                            <CardDescription>
                                Utilize chaves de API para autenticar requisições externas e acessar dados do CRM de forma programática.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert className="border-amber-500/20 bg-amber-500/5 text-amber-500">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>API em Desenvolvimento</AlertTitle>
                                <AlertDescription>
                                    O acesso via API pública está em fase Beta. Algumas funcionalidades podem mudar.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <h3 className="font-bold text-white">Autenticação</h3>
                                <p className="text-zinc-400 text-sm">Todas as requisições devem incluir o header:</p>
                                <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-sm text-emerald-400">
                                    Authorization: Bearer SUA_CHAVE_DE_API
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="space-y-4">
                                <h3 className="font-bold text-white">Endpoints Disponíveis</h3>

                                <div className="space-y-4">
                                    <div className="border border-zinc-800 rounded-xl overflow-hidden">
                                        <div className="bg-zinc-900/50 p-3 border-b border-zinc-800 flex items-center gap-3">
                                            <Badge className="bg-blue-600 hover:bg-blue-500">GET</Badge>
                                            <code className="text-sm font-bold text-zinc-300">/api/v1/clients</code>
                                        </div>
                                        <div className="p-4 bg-zinc-950 text-sm text-zinc-400">
                                            Lista todos os clientes do CRM. Suporta filtros por ?pipelineId=... e ?status=...
                                        </div>
                                    </div>

                                    <div className="border border-zinc-800 rounded-xl overflow-hidden">
                                        <div className="bg-zinc-900/50 p-3 border-b border-zinc-800 flex items-center gap-3">
                                            <Badge className="bg-emerald-600 hover:bg-emerald-500">POST</Badge>
                                            <code className="text-sm font-bold text-zinc-300">/api/v1/clients</code>
                                        </div>
                                        <div className="p-4 bg-zinc-950 text-sm text-zinc-400">
                                            Cria um novo lead no CRM. Requer JSON no corpo da requisição com name, email, phone, etc.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end">
                <Link href="/clientes">
                    <Button variant="outline" className="gap-2">
                        Voltar para CRM <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
