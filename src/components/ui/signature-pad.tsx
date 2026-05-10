"use client"

import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Eraser, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
    className?: string;
    onSave: (signatureDataUrl: string) => void;
}

export const SignaturePad = forwardRef<any, SignaturePadProps>(({ className, onSave }, ref) => {
    const padRef = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    useImperativeHandle(ref, () => ({
        clear: handleClear,
        isEmpty: () => isEmpty
    }));

    const handleClear = () => {
        padRef.current?.clear();
        setIsEmpty(true);
    };

    const handleEnd = () => {
        setIsEmpty(false);
    }

    const handleSave = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            // Returns base64 PNG
            const data = padRef.current.getTrimmedCanvas().toDataURL('image/png');
            onSave(data);
        }
    };

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <div className="border-2 border-dashed border-zinc-700 rounded-xl overflow-hidden bg-white/5 relative">
                <SignatureCanvas
                    ref={padRef}
                    onEnd={handleEnd}
                    canvasProps={{
                        className: "signature-canvas w-full h-[200px] cursor-crosshair bg-transparent",
                        style: { width: '100%', height: '200px' }
                    }}
                    minWidth={1}
                    maxWidth={2.5}
                    penColor="white" // White ink for dark mode
                />

                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-zinc-500 text-sm font-medium opacity-50 uppercase tracking-widest">
                            Assine aqui com o dedo ou mouse
                        </span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-white"
                >
                    <Eraser className="w-4 h-4 mr-2" /> Limpar
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isEmpty}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                    <Check className="w-4 h-4 mr-2" /> Confirmar Assinatura
                </Button>
            </div>
        </div>
    )
})

SignaturePad.displayName = "SignaturePad"
