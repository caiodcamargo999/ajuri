"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MessageSquare, QrCode, Link2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function WhatsAppConfigPage() {
    const [apiKey, setApiKey] = useState("")
    const [apiUrl, setApiUrl] = useState("")
    const [instanceName, setInstanceName] = useState("")
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
    const [showQR, setShowQR] = useState(false)

    const handleConnect = async () => {
        if (!apiUrl || !apiKey || !instanceName) {
            toast.error("Preencha todos os campos para conectar.")
            return
        }

        setStatus('connecting')
        // Simulate connection to Evolution API
        setTimeout(() => {
            setShowQR(true)
            toast.info("Instância criada! Leia o QR Code para conectar.")
        }, 2000)
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Conexão WhatsApp</h1>
                <p className="text-muted-foreground">Conecte sua conta do WhatsApp via Evolution API para enviar petições e conversar com clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-emerald-500" />
                            Configurações da API
                        </CardTitle>
                        <CardDescription>Configure os dados da sua instância da Evolution API.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>URL da API</Label>
                            <Input
                                placeholder="https://sua-api.com"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input
                                    type="password"
                                    placeholder="Sua API Key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nome da Instância</Label>
                                <Input
                                    placeholder="Ex: Ajuri_Office"
                                    value={instanceName}
                                    onChange={(e) => setInstanceName(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleConnect}
                            disabled={status === 'connecting'}
                        >
                            {status === 'connecting' ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Conectando...</>
                            ) : (
                                "Conectar e Gerar QR Code"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-emerald-500" />
                            QR Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
                        {showQR ? (
                            <div className="space-y-4 text-center">
                                <div className="bg-white p-4 rounded-xl shadow-inner border animate-in fade-in zoom-in">
                                    {/* Mock QR Code */}
                                    <div className="w-40 h-40 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=AjuriApp')] bg-center bg-no-repeat" />
                                </div>
                                <p className="text-xs text-muted-foreground">Aguardando leitura do QR Code...</p>
                            </div>
                        ) : (
                            <div className="text-center space-y-2 opacity-50">
                                <AlertCircle className="w-12 h-12 mx-auto" />
                                <p className="text-sm">Preencha os dados ao lado para gerar o QR Code.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardHeader>
                    <CardTitle className="text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Por que conectar?
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                        <p className="font-semibold">Envio Automatizado</p>
                        <p className="text-muted-foreground">Envie as petições geradas no AJURI X direto para o WhatsApp do cliente com um clique.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold">Chat Centralizado</p>
                        <p className="text-muted-foreground">Responda aos seus clientes sem sair do sistema jurídico, mantendo todo o histórico no CRM.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
