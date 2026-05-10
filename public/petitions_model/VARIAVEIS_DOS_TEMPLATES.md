# Variáveis dos Templates de Petição — Ajuri
> Documento gerado com base na leitura dos arquivos originais do escritório Sena Advocacia (Manaus/AM).

---

## Variáveis Compartilhadas (Ambos os Templates)

### Dados do Autor (Cliente)

| Variável | Descrição | Exemplo |
|---|---|---|
| `{{NOME_AUTOR}}` | Nome completo do cliente | FULANO DE TAL |
| `{{NACIONALIDADE}}` | Nacionalidade | brasileiro(a) |
| `{{ESTADO_CIVIL}}` | Estado civil | casado(a), solteiro(a) |
| `{{PROFISSAO}}` | Profissão | autônomo(a) |
| `{{CPF_AUTOR}}` | CPF formatado | 437.013.882-53 |
| `{{RG_AUTOR}}` | RG com órgão emissor | 00000000 - SSP/AM |
| `{{EMAIL_AUTOR}}` | E-mail do cliente (usado no template de seguro) | cliente@email.com |
| `{{ENDERECO_COMPLETO}}` | Nome da rua/avenida | Rua Efésios |
| `{{NUMERO_ENDERECO}}` | Número do imóvel | 11 |
| `{{BAIRRO}}` | Bairro | Petrópolis |
| `{{CEP}}` | CEP formatado | 69.067-760 |

### Dados do Réu (Banco)

| Variável | Descrição | Exemplo |
|---|---|---|
| `{{NOME_BANCO}}` | Razão social do banco | BANCO BRADESCO S/A |
| `{{CNPJ_BANCO}}` | CNPJ formatado | 60.746.948/0001-12 |
| `{{ENDERECO_BANCO}}` | Endereço completo da sede | Núcleo Cidade de Deus, s/nº, Vila Yara, CEP 06.029-900, Osasco/SP |

### Valores e Cálculos

| Variável | Descrição | Exemplo |
|---|---|---|
| `{{TABELA_DESCONTOS}}` | Tabela com todas as cobranças indevidas | (gerada pelo sistema) |
| `{{RUBRICA}}` | Nome exato da tarifa/rubrica cobrada | PACOTE DE SERVIÇO PADRONIZADO PRIORITÁRIOS I |
| `{{TOTAL_DESCONTOS}}` | Soma das cobranças (R$) | 97,70 |
| `{{TOTAL_DESCONTOS_EXTENSO}}` | Valor por extenso | noventa e sete reais e setenta centavos |
| `{{TOTAL_DOBRO}}` | Total × 2 (repetição do indébito art. 42 CDC) | 195,40 |
| `{{TOTAL_DOBRO_EXTENSO}}` | Dobro por extenso | cento e noventa e cinco reais e quarenta centavos |
| `{{VALOR_DANO_MORAL}}` | Valor do dano moral pleiteado | 20.000,00 |
| `{{VALOR_DANO_MORAL_EXTENSO}}` | Dano moral por extenso | vinte mil reais |
| `{{VALOR_TEMPO_DESPERDICADO}}` | Valor pelo tempo desperdiçado (Teoria Desvio Produtivo) | 2.000,00 |
| `{{VALOR_TEMPO_DESPERDICADO_EXTENSO}}` | Tempo desperdiçado por extenso | dois mil reais |
| `{{TOTAL_CAUSA}}` | Valor total da causa | 22.195,40 |
| `{{TOTAL_CAUSA_EXTENSO}}` | Total da causa por extenso | vinte e dois mil cento e noventa e cinco reais e quarenta centavos |

### Data e Identificação da Ação

| Variável | Descrição | Exemplo |
|---|---|---|
| `{{DATA_EXTENSO}}` | Data de geração da petição | 09 de maio de 2026 |
| `{{TITULO_ACAO}}` | Título centralizado da ação (Template Tarifas) | AÇÃO DECLARATÓRIA DE NULIDADE C/C REPETIÇÃO DO INDÉBITO E INDENIZAÇÃO POR DANOS MORAIS |
| `{{DATA_PRIMEIRO_DESCONTO}}` | Data do primeiro desconto indevido | janeiro de 2022 |

---

## Variáveis Exclusivas — Template de Seguro de Veículos

| Variável | Descrição | Exemplo |
|---|---|---|
| `{{NUMERO_VARA}}` | Número da vara do juizado | 1ª, 2ª, 3ª... |
| `{{NUMERO_CONTRATO}}` | Número da cédula de crédito bancário | 2992636 |
| `{{DATA_CONTRATO}}` | Data de assinatura do contrato | 13/06/2024 |
| `{{NUMERO_PARCELAS}}` | Número de parcelas do financiamento | 48 |
| `{{NUMERO_PARCELAS_EXTENSO}}` | Parcelas por extenso | quarenta e oito |
| `{{NOME_SEGURO}}` | Nome exato do produto de seguro cobrado | SEGURO PROTEÇÃO FINANCEIRA |
| `{{VALOR_SEGURO}}` | Valor total do seguro cobrado (R$) | 1.237,25 |
| `{{VALOR_SEGURO_EXTENSO}}` | Valor do seguro por extenso | um mil, duzentos e trinta e sete reais e vinte e cinco centavos |

---

## Informações Fixas (Hardcoded nos Templates)

Estes valores são **fixos** do escritório Sena Advocacia e **não são variáveis** — estão embutidos diretamente no texto dos templates:

| Campo | Valor Fixo |
|---|---|
| Endereço do advogado | Avenida Fernando Pessoa, 1179, Japiim II - CEP 69.076-790, Manaus – Amazonas |
| Comarca | Manaus – Amazonas |
| Jurisprudência TJ-AM (Tarifas) | Apelação Cível nº 0624128-78.2022.8.04.0001, Rel. Des. Yedo Simões de Oliveira |
| Jurisprudência STJ (Seguro) | REsp. 1.639.259 (teses sobre seguro em contratos bancários) |

---

## Regras de Negócio para o Sistema Ajuri

1. **Conversão para extenso:** usar IA (GPT-4o) para converter valores numéricos em texto por extenso.
2. **Tabela de descontos:** gerar no formato de tabela com colunas Data | Descrição | Valor, com linha de total ao final.
3. **Total da causa (Tarifas):** `TOTAL_DOBRO + VALOR_DANO_MORAL + VALOR_TEMPO_DESPERDICADO`
4. **Total da causa (Seguro):** `TOTAL_DOBRO + VALOR_DANO_MORAL`
5. **Repetição do indébito:** `TOTAL_DESCONTOS × 2` (art. 42, § único, CDC)
6. **Dano moral padrão:** R$ 20.000,00 (conforme documentos originais do escritório)
7. **Gênero gramatical:** adaptar terminações (o/a, do/da, portador/a etc.) conforme gênero do cliente.

---

## Mapeamento — Formulário Ajuri X → Templates

| Campo no Formulário Ajuri X | Variável no Template |
|---|---|
| Etapa 1 — Nome | `{{NOME_AUTOR}}` |
| Etapa 1 — CPF | `{{CPF_AUTOR}}` |
| Etapa 1 — RG | `{{RG_AUTOR}}` |
| Etapa 1 — Nacionalidade | `{{NACIONALIDADE}}` |
| Etapa 1 — Estado Civil | `{{ESTADO_CIVIL}}` |
| Etapa 1 — Profissão | `{{PROFISSAO}}` |
| Etapa 1 — E-mail | `{{EMAIL_AUTOR}}` |
| Etapa 1 — Rua | `{{ENDERECO_COMPLETO}}` |
| Etapa 1 — Número | `{{NUMERO_ENDERECO}}` |
| Etapa 1 — Bairro | `{{BAIRRO}}` |
| Etapa 1 — CEP | `{{CEP}}` |
| Etapa 2 — Banco selecionado | `{{NOME_BANCO}}`, `{{CNPJ_BANCO}}`, `{{ENDERECO_BANCO}}` |
| Etapa 3 — Nome da rubrica/seguro | `{{RUBRICA}}` / `{{NOME_SEGURO}}` |
| Etapa 3 — Lista de descontos | `{{TABELA_DESCONTOS}}`, `{{TOTAL_DESCONTOS}}` |
| Etapa 3 — Data do contrato (Seguro) | `{{DATA_CONTRATO}}`, `{{NUMERO_CONTRATO}}`, `{{NUMERO_PARCELAS}}`, `{{VALOR_SEGURO}}` |
| Etapa 4 — Dano moral | `{{VALOR_DANO_MORAL}}` (padrão R$ 20.000,00) |
| Geração — Data atual | `{{DATA_EXTENSO}}` |
| Geração — Cálculos automáticos | `{{TOTAL_DOBRO}}`, `{{TOTAL_CAUSA}}`, todos os valores extensos |
