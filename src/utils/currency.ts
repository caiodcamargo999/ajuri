import porExtenso from 'numero-por-extenso';

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function valorPorExtenso(valor: number): string {
    return porExtenso.porExtenso(valor, porExtenso.estilo.monetario);
}
