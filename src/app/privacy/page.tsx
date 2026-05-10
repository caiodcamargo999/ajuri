export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 py-16 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidade</h1>

                <p className="text-sm text-zinc-500">Última atualização: 01 de Janeiro de 2026</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Introdução</h2>
                    <p>
                        A sua privacidade é importante para nós. Esta Política de Privacidade explica como a Ajuri ("nós", "nosso") coleta, usa, compartilha e protege as informações pessoais dos usuários ("você") de nossa plataforma, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Coleta de Dados</h2>
                    <p>Coletamos os seguintes tipos de informações:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Dados de Cadastro:</strong> Nome, e-mail, telefone, CPF/CNPJ e endereço profissional.</li>
                        <li><strong>Dados de Uso:</strong> Informações sobre como você interage com a plataforma, registros de acesso (IP, data e hora).</li>
                        <li><strong>Dados processados na plataforma:</strong> Informações de clientes e processos inseridos por você para utilização das ferramentas de automação.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. Finalidade do Tratamento</h2>
                    <p>Utilizamos seus dados para:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Fornecer e manter os serviços da plataforma.</li>
                        <li>Processar pagamentos e gerenciar sua assinatura.</li>
                        <li>Melhorar a experiência do usuário e desenvolver novas funcionalidades.</li>
                        <li>Enviar comunicações importantes, como atualizações de serviço e suporte técnico.</li>
                        <li>Cumprir obrigações legais e regulatórias.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">4. Compartilhamento de Dados</h2>
                    <p>
                        Não vendemos seus dados pessoais. Podemos compartilhar informações com:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Fornecedores de serviços essenciais (ex: processamento de pagamentos, hospedagem em nuvem).</li>
                        <li>Autoridades legais, quando exigido por lei ou ordem judicial.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">5. Segurança dos Dados</h2>
                    <p>
                        Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia e protocolos de segurança padrão da indústria.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">6. Seus Direitos (Titular dos Dados)</h2>
                    <p>
                        De acordo com a LGPD, você tem direito a:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Confirmar a existência de tratamento de seus dados.</li>
                        <li>Acessar seus dados.</li>
                        <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                        <li>Solicitar a eliminação de dados desnecessários ou tratados em desconformidade.</li>
                        <li>Revogar o consentimento, quando aplicável.</li>
                    </ul>
                    <p>
                        Para exercer seus direitos, entre em contato conosco através do e-mail: juridico@ajuri.com.br.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">7. Cookies</h2>
                    <p>
                        Utilizamos cookies para melhorar a funcionalidade do site e analisar o tráfego. Você pode configurar seu navegador para recusar cookies, mas isso pode limitar algumas funcionalidades da plataforma.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">8. Alterações nesta Política</h2>
                    <p>
                        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através da plataforma ou por e-mail.
                    </p>
                </section>
            </div>
        </div>
    )
}
