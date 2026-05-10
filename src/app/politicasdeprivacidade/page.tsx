export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 py-16 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidade</h1>

                <p className="text-sm text-zinc-500">Última atualização: 01 de Janeiro de 2026</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Introdução</h2>
                    <p>
                        A Rarity Projects ("nós", "nosso" ou "nossa") está comprometida em proteger a privacidade e segurança dos dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza a plataforma Ajuri.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Informações que Coletamos</h2>
                    <p>Coletamos as seguintes categorias de informações:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Dados de Cadastro:</strong> Nome completo, e-mail, telefone, CPF/CNPJ, OAB (quando aplicável).</li>
                        <li><strong>Dados de Uso:</strong> Informações sobre como você utiliza a plataforma, incluindo páginas visitadas, recursos utilizados e horários de acesso.</li>
                        <li><strong>Dados de Pagamento:</strong> Informações de cobrança processadas de forma segura por meio de nossos parceiros de pagamento certificados.</li>
                        <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional e identificadores de dispositivo.</li>
                        <li><strong>Dados Jurídicos:</strong> Informações relacionadas a processos, clientes e documentos criados na plataforma.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. Como Usamos Suas Informações</h2>
                    <p>Utilizamos suas informações para:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Fornecer, operar e manter nossos serviços.</li>
                        <li>Processar transações e gerenciar sua conta.</li>
                        <li>Enviar notificações administrativas e atualizações de serviço.</li>
                        <li>Melhorar, personalizar e expandir nossos serviços.</li>
                        <li>Analisar tendências de uso e preferências dos usuários.</li>
                        <li>Detectar, prevenir e combater fraudes ou atividades ilegais.</li>
                        <li>Cumprir obrigações legais e regulatórias.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">4. Compartilhamento de Dados</h2>
                    <p>
                        Não vendemos, alugamos ou comercializamos seus dados pessoais. Podemos compartilhar informações apenas nas seguintes circunstâncias:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Prestadores de Serviços:</strong> Empresas terceirizadas que nos auxiliam na operação da plataforma (ex: hospedagem, processamento de pagamentos).</li>
                        <li><strong>Exigências Legais:</strong> Quando obrigados por lei, decisão judicial ou requisição de autoridade competente.</li>
                        <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos, propriedade ou segurança, ou de nossos usuários.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">5. Segurança dos Dados</h2>
                    <p>
                        Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Criptografia de dados em trânsito e em repouso (SSL/TLS).</li>
                        <li>Controles de acesso baseados em função.</li>
                        <li>Auditorias de segurança regulares.</li>
                        <li>Armazenamento de dados em servidores seguros e certificados.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">6. Seus Direitos (LGPD)</h2>
                    <p>
                        De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Confirmação da existência de tratamento de seus dados.</li>
                        <li>Acesso aos dados pessoais armazenados.</li>
                        <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                        <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                        <li>Portabilidade de dados a outro fornecedor de serviço.</li>
                        <li>Revogação do consentimento.</li>
                    </ul>
                    <p className="mt-4">
                        Para exercer seus direitos, entre em contato conosco através do e-mail: <strong className="text-white">caiorarity@gmail.com</strong>
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">7. Retenção de Dados</h2>
                    <p>
                        Retemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, salvo quando um período de retenção maior for exigido ou permitido por lei.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">8. Cookies e Tecnologias Similares</h2>
                    <p>
                        Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da plataforma e fornecer conteúdo personalizado. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">9. Alterações nesta Política</h2>
                    <p>
                        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer mudanças significativas através de aviso em nossa plataforma ou por e-mail. Recomendamos que você revise esta política regularmente.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">10. Contato</h2>
                    <p>
                        Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre o tratamento de seus dados, entre em contato conosco:
                    </p>
                    <div className="bg-zinc-900 p-4 rounded-lg mt-4">
                        <p><strong className="text-white">Rarity Projects</strong></p>
                        <p>E-mail: caiorarity@gmail.com</p>
                        <p>Endereço: Manaus, AM, Brasil</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
