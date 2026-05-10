"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { PetitionData, ClientData, BankData, ChargeItem, BANKS } from "@/types/petition";
import { getCurrentDateFormatted } from "@/utils/formatters";

// Defined in Index.tsx originally
const initialClientData: ClientData = {
    name: "",
    nationality: "brasileiro",
    civilStatus: "",
    profession: "",
    cpf: "",
    rg: "",
    rgIssuer: "SSP/AM",
    street: "",
    number: "",
    neighborhood: "",
    cep: "",
    city: "Manaus",
    state: "AM",
    comarca: "MANAUS",
};

interface PetitionContextType {
    data: PetitionData;
    updateClient: (data: ClientData) => void;
    updateBank: (data: BankData) => void;
    updateCharges: (
        charges: ChargeItem[],
        description: string,
        type: PetitionData["petitionType"],
        moral: number,
        time: number,
        screenshots: string[]
    ) => void;
    reset: () => void;
}

const PetitionContext = createContext<PetitionContextType | undefined>(undefined);

export function PetitionProvider({ children }: { children: React.ReactNode }) {
    const [client, setClient] = useState<ClientData>(initialClientData);
    const [bank, setBank] = useState<BankData>(BANKS[0]); // Default to first bank
    const [petitionType, setPetitionType] = useState<PetitionData["petitionType"]>("TARIFAS_INDEVIDAS");
    const [chargeDescription, setChargeDescription] = useState("PACOTE DE SERVIÇO PADRONIZADO PRIORITÁRIOS I");
    const [charges, setCharges] = useState<ChargeItem[]>([]);
    const [moralDamage, setMoralDamage] = useState(5000);
    const [wastedTimeDamage, setWastedTimeDamage] = useState(2000);
    const [chargeScreenshots, setChargeScreenshots] = useState<string[]>([]);
    const [dateOfPetition] = useState(getCurrentDateFormatted());

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("ajuri-petition-draft");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.client) setClient(parsed.client);
                if (parsed.bank) setBank(parsed.bank);
                if (parsed.charges) setCharges(parsed.charges);
                // ... rest of hydration
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        const data = { client, bank, charges, petitionType, chargeDescription, moralDamage, wastedTimeDamage, chargeScreenshots };
        localStorage.setItem("ajuri-petition-draft", JSON.stringify(data));
    }, [client, bank, charges, petitionType, chargeDescription, moralDamage, wastedTimeDamage, chargeScreenshots]);

    const updateClient = (data: ClientData) => setClient(data);
    const updateBank = (data: BankData) => setBank(data);
    const updateCharges = (
        newCharges: ChargeItem[],
        desc: string,
        type: PetitionData["petitionType"],
        moral: number,
        time: number,
        screenshots: string[]
    ) => {
        setCharges(newCharges);
        setChargeDescription(desc);
        setPetitionType(type);
        setMoralDamage(moral);
        setWastedTimeDamage(time);
        setChargeScreenshots(screenshots);
    };

    const reset = () => {
        setClient(initialClientData);
        setBank(BANKS[0]);
        setCharges([]);
        localStorage.removeItem("ajuri-petition-draft");
    };

    const value: PetitionContextType = {
        data: {
            client,
            bank,
            petitionType,
            chargeDescription,
            charges,
            moralDamage,
            wastedTimeDamage,
            dateOfPetition,
            chargeScreenshots,
        },
        updateClient,
        updateBank,
        updateCharges,
        reset,
    };

    return (
        <PetitionContext.Provider value={value}>
            {children}
        </PetitionContext.Provider>
    );
}

export function usePetition() {
    const context = useContext(PetitionContext);
    if (context === undefined) {
        throw new Error("usePetition must be used within a PetitionProvider");
    }
    return context;
}
