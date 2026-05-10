'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { FormControl } from '@/components/ui/form';

interface ComarcaFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

interface Municipio {
    nome: string;
    uf: string;
}

// Global cache to persist cities across component re-mounts (popover toggles)
let globalCitiesCache: Municipio[] | null = null;
let isFetchingGlobal = false;
const fetchListeners: Array<(cities: Municipio[]) => void> = [];

export function ComarcaField({ value, onChange, placeholder }: ComarcaFieldProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [cities, setCities] = React.useState<Municipio[]>(globalCitiesCache || []);

    // Carregar dados
    React.useEffect(() => {
        if (globalCitiesCache) {
            setCities(globalCitiesCache);
            return;
        }

        if (isFetchingGlobal) {
            const listener = (fetchedCities: Municipio[]) => setCities(fetchedCities);
            fetchListeners.push(listener);
            setLoading(true);
            return () => {
                const index = fetchListeners.indexOf(listener);
                if (index > -1) fetchListeners.splice(index, 1);
            };
        }

        const loadAllCities = async () => {
            try {
                setLoading(true);
                isFetchingGlobal = true;

                // We fetch all cities once (it's around 500KB-800KB)
                const response = await fetch(
                    `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`
                );

                if (!response.ok) throw new Error("Falha ao buscar municípios do IBGE");

                const data = await response.json();

                const formatted = data.map((m: any) => ({
                    nome: m.nome,
                    // IBGE structure can vary slightly, so we use multiple paths for safety
                    uf: m.microrregiao?.mesorregiao?.UF?.sigla ||
                        m["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla ||
                        m.UF?.sigla ||
                        "??",
                }));

                globalCitiesCache = formatted;
                setCities(formatted);

                // Notify other instances waiting for the same global fetch
                fetchListeners.forEach(l => l(formatted));
                fetchListeners.length = 0;
            } catch (error) {
                console.error('Error fetching cities:', error);
                // Fallback for extreme cases so it doesn't stay stuck loading
                if (!globalCitiesCache) {
                    setCities([]);
                }
            } finally {
                setLoading(false);
                isFetchingGlobal = false;
            }
        };

        loadAllCities();
    }, []);

    // Filter based on search - Optimization to handle 5500+ items
    const filteredItems = React.useMemo(() => {
        if (!cities.length) return [];

        const normalize = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const searchNormalized = normalize(search);

        // Se não houver busca, mostra os primeiros 50 municípios (alfabético por causa do API orderBy)
        if (!searchNormalized) return cities.slice(0, 50);

        // Filtragem robusta que busca por nome da cidade
        return cities
            .filter(m => normalize(m.nome).includes(searchNormalized))
            .slice(0, 80);
    }, [search, cities]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl focus:ring-emerald-500/20 px-4",
                            !value && "text-zinc-500"
                        )}
                    >
                        <div className="truncate text-left flex-1">
                            {value ? value : placeholder || "Selecione a Comarca..."}
                        </div>
                        {(loading || isFetchingGlobal) && !cities.length ? (
                            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                        ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-950 border-zinc-800 shadow-2xl z-[100] rounded-xl overflow-hidden">
                <Command shouldFilter={false} className="bg-zinc-950">
                    <div className="flex items-center border-b border-zinc-900 px-3" cmdk-input-wrapper="">
                        <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50 text-emerald-500" />
                        <CommandInput
                            placeholder="Digite o nome da cidade (ex: São Paulo)..."
                            onValueChange={setSearch}
                            className="h-12 border-none focus:ring-0 bg-transparent text-white w-full"
                        />
                    </div>

                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar bg-zinc-950">
                        {(loading || (isFetchingGlobal && !cities.length)) && (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] animate-pulse">
                                    Sincronizando Municípios...
                                </p>
                            </div>
                        )}

                        {!loading && !isFetchingGlobal && search.length > 0 && filteredItems.length === 0 && (
                            <div className="py-12 text-center flex flex-col items-center gap-2">
                                <span className="text-zinc-600 font-medium text-sm">Nenhuma comarca encontrada para</span>
                                <span className="text-emerald-500 font-bold bg-emerald-500/5 px-3 py-1 rounded-full text-xs">"{search}"</span>
                            </div>
                        )}

                        {!loading && !isFetchingGlobal && !search && cities.length > 0 && (
                            <div className="px-4 py-3 border-b border-zinc-900 bg-zinc-900/20">
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Comarcas Disponíveis</p>
                            </div>
                        )}

                        <CommandGroup className="p-2">
                            {filteredItems.map((item) => {
                                const label = `${item.nome}/${item.uf}`;
                                return (
                                    <CommandItem
                                        key={label}
                                        value={label}
                                        onSelect={() => {
                                            onChange(label);
                                            setOpen(false);
                                        }}
                                        className="flex items-center gap-3 p-3 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-xl m-0.5 transition-all border border-transparent hover:border-emerald-500/20"
                                    >
                                        <div className={cn(
                                            "h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all shrink-0",
                                            value === label
                                                ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                                : "bg-white/5 border-white/10 text-zinc-500"
                                        )}>
                                            {item.uf}
                                        </div>
                                        <span className="flex-1 font-semibold truncate">{item.nome}</span>
                                        {value === label && <Check className="h-4 w-4 text-emerald-500" />}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
