import { BookOpen, UserPlus, FileText, Zap, Settings, LayoutDashboard, CheckSquare } from "lucide-react"

export default function DocumentacaoPage() {
    return (
        <div className="flex flex-1 flex-col animate-in fade-in duration-700 bg-black min-h-screen relative">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full -ml-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-10 p-6 md:p-12 relative z-10 pb-32">
                <header className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                            <BookOpen className="w-10 h-10 text-cyan-400" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                                Central de Ajuda
                            </h1>
                            <p className="text-zinc-400 text-base md:text-lg font-medium max-w-2xl">
                                Aprenda a configurar seu escritório e dominar todas as funcionalidades do AJURI para extrair o máximo da plataforma.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Passo 1 */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-900 transition-colors">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Settings className="w-6 h-6 text-pink-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">1. Customização da Conta</h2>
                        <p className="text-zinc-400 mb-4 leading-relaxed">
                            A primeira coisa a fazer é configurar a identidade visual do seu escritório para que todos os documentos gerados saiam perfeitos.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-300">
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5" /> Vá até a aba <strong>Customização</strong> no menu lateral.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5" /> Faça o upload da sua Logomarca.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5" /> Defina a cor principal do escritório, o endereço e o número da OAB.</li>
                        </ul>
                    </div>

                    {/* Passo 2 */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-900 transition-colors">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                            <UserPlus className="w-6 h-6 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">2. Cadastro de Clientes</h2>
                        <p className="text-zinc-400 mb-4 leading-relaxed">
                            Mantenha o controle de quem você atende. Isso facilita a automação da geração de documentos no futuro.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-300">
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" /> Acesse a aba <strong>Clientes</strong> e clique em Novo Cliente.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" /> Preencha todos os dados civis (CPF, Estado Civil, Profissão e Endereço).</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" /> Esses dados ficarão salvos e serão sugeridos automaticamente quando você for criar um novo documento.</li>
                        </ul>
                    </div>

                    {/* Passo 3 */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-900 transition-colors md:col-span-2">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">3. Modelos de Petições e Docs Customizados</h2>
                        <p className="text-zinc-400 mb-4 leading-relaxed">
                            O AJURI permite que você suba seus próprios modelos de contrato, procuração ou petições e transforme eles em "Fábricas de PDF" automatizadas.
                        </p>
                        <div className="grid md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <h3 className="font-bold text-white mb-2">A. Subindo o Modelo</h3>
                                <ul className="space-y-2 text-sm text-zinc-300">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> Vá no Menu do usuário (canto inferior esquerdo) e clique em <strong>Configurações da Conta</strong>.</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> Acesse a aba <strong>Modelos</strong> e clique em Novo Modelo.</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> Faça upload do seu arquivo <code>.docx</code>. O sistema vai extrair todo o texto e formatação.</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> Dentro do texto, digite os <strong>códigos mágicos</strong> onde quiser (ex: <code>{"{{NOME_CLIENTE}}"}</code>, <code>{"{{CPF}}"}</code>) e salve.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2">B. Gerando o PDF Timbrado</h3>
                                <ul className="space-y-2 text-sm text-zinc-300">
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> Acesse a aba <strong>Docs</strong> ou <strong>Petições</strong>.</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> O seu novo modelo estará lá como um botão clicável.</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> Clique nele, busque pelo nome do seu cliente para autocompletar os dados, preencha os dados extras (como Valor da Causa) e clique em Gerar.</li>
                                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> O documento será gerado envelopado no papel timbrado do seu escritório!</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Passo 4 */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-900 transition-colors">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">4. AJURI X Intelligence</h2>
                        <p className="text-zinc-400 mb-4 leading-relaxed">
                            Use a Inteligência Artificial Jurídica mais avançada do mercado para redigir peças processuais complexas do zero, embasadas em jurisprudência.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-300">
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" /> Clique em <strong>AJURI X</strong> no menu lateral.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" /> Preencha o formulário detalhado sobre a sua causa (Polo Ativo, Passivo, Fatos e Pedidos).</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" /> A IA vai redigir uma petição completa. Você poderá revisá-la, editá-la e até conversar com o Agente para pedir ajustes finos (ex: "Deixe mais agressivo", "Cite o artigo X").</li>
                        </ul>
                    </div>

                    {/* Passo 5 */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:bg-zinc-900 transition-colors">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">5. Gestão e Produtividade</h2>
                        <p className="text-zinc-400 mb-4 leading-relaxed">
                            Organize a rotina do seu escritório utilizando as ferramentas de gerenciamento visual.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-300">
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" /> <strong>Processos:</strong> Acompanhe o andamento dos processos na aba Processos, atualizando o status de cada um de forma visual e intuitiva.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" /> <strong>Tarefas (Kanban):</strong> Na aba Tarefas, crie cards para as pendências diárias ("A Fazer", "Em Andamento", "Concluído") e nunca mais perca um prazo.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" /> <strong>Dashboard:</strong> Veja o resumo financeiro, processual e de produtividade da sua equipe.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
