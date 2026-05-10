export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 py-16 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">Termos de Uso</h1>

                <p className="text-sm text-zinc-500">Última atualização: 01 de Janeiro de 2026</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar e utilizar a plataforma Ajuri ("Plataforma"), você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, você não deve utilizar nossos serviços.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Serviços Oferecidos</h2>
                    <p>
                        O Ajuri é uma plataforma SaaS (Software as a Service)voltada para a automação e gestão jurídica, oferecendo ferramentas para criação de petições, cálculos judiciais e gestão de clientes.
                    </p>
                    <p>
                        Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto do serviço a qualquer momento, com ou sem aviso prévio.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. Cadastro e Responsabilidades</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
                        <li>As informações fornecidas no cadastro devem ser precisas e atualizadas.</li>
                        <li>O uso da conta é pessoal e intransferível.</li>
                        <li>Qualquer atividade realizada através de sua conta é de sua inteira responsabilidade.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">4. Propriedade Intelectual</h2>
                    <p>
                        Todo o conteúdo, software, marcas, logotipos e design da plataforma Ajuri são de propriedade exclusiva da Rarity Projects ou de seus licenciadores, estando protegidos pelas leis de propriedade intelectual do Brasil e tratados internacionais.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">5. Planos e Pagamentos</h2>
                    <p>
                        Os serviços podem ser oferecidos sob diferentes planos de assinatura. Os detalhes sobre preços, formas de pagamento e cancelamento estão disponíveis na área de assinatura da plataforma. O não pagamento pode resultar na suspensão ou cancelamento do acesso aos serviços.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">6. Limitação de Responsabilidade</h2>
                    <p>
                        O Ajuri não se responsabiliza por:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Danos indiretos, incidentais ou consequenciais decorrentes do uso da plataforma.</li>
                        <li>Falhas na internet, sistemas ou serviços de terceiros.</li>
                        <li>Precisão jurídica absoluta dos modelos gerados, cabendo ao advogado a revisão técnica final.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">7. Disposições Gerais</h2>
                    <p>
                        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Manaus/AM para dirimir quaisquer dúvidas oriundas deste contrato.
                    </p>
                </section>
            </div>
        </div>
    )
}
