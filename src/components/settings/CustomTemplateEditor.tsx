"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Save, Upload, X, Trash2, ArrowLeft } from "lucide-react";
import mammoth from "mammoth";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export interface CustomTemplate {
  id: string;
  title: string;
  content: string; // HTML content
  createdAt: string;
}

interface CustomTemplateEditorProps {
  onBack: () => void;
  editingTemplate?: CustomTemplate | null;
}

export const STORAGE_KEY_TEMPLATES = "ajuri_custom_templates";

export function CustomTemplateEditor({ onBack, editingTemplate }: CustomTemplateEditorProps) {
  const [title, setTitle] = useState(editingTemplate?.title || "");
  const [content, setContent] = useState(editingTemplate?.content || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      toast.error("Por favor, faça upload de um arquivo .docx");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        
        // Use mammoth to convert docx to HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        const html = result.value; // The generated HTML
        
        // Append or replace content
        if (content && !window.confirm("Isso irá substituir o texto atual. Deseja continuar?")) {
            return;
        }

        setContent(html);
        toast.success("Arquivo convertido com sucesso! Ajuste os detalhes no editor.");
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao converter arquivo. Verifique se é um .docx válido.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Por favor, dê um título ao seu modelo.");
      return;
    }
    if (!content.trim()) {
      toast.error("O modelo não pode estar vazio.");
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      let templates: CustomTemplate[] = stored ? JSON.parse(stored) : [];

      if (editingTemplate) {
        templates = templates.map((t) => 
          t.id === editingTemplate.id ? { ...t, title, content } : t
        );
        toast.success("Modelo atualizado com sucesso!");
      } else {
        const newTemplate: CustomTemplate = {
          id: crypto.randomUUID(),
          title,
          content,
          createdAt: new Date().toISOString(),
        };
        templates.push(newTemplate);
        toast.success("Modelo salvo com sucesso!");
      }

      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
      onBack();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar o modelo.");
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h3 className="text-xl font-bold">
            {editingTemplate ? "Editar Modelo" : "Novo Modelo de Petição"}
          </h3>
          <p className="text-sm text-zinc-500">
            Faça upload de um arquivo .docx ou digite abaixo.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
        <div className="space-y-2">
          <Label>Título do Documento</Label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Ex: Petição Inicial - Danos Morais"
            className="bg-black/50 border-white/10"
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Label>Conteúdo do Modelo</Label>
            
            <div className="flex gap-2">
              <input 
                type="file" 
                accept=".docx" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                className="hidden" 
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload .docx
              </Button>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-blue-500/20 text-sm">
            <h4 className="font-bold text-blue-400 mb-2">Variáveis Dinâmicas Disponíveis:</h4>
            <p className="text-zinc-400 mb-2">
              Utilize os códigos abaixo no seu texto. Eles serão substituídos automaticamente pelos dados do cliente na aba Docs:
            </p>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{NOME_CLIENTE}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{CPF}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{RG}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{ESTADO_CIVIL}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{PROFISSAO}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{ENDERECO_COMPLETO}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{TIPO_ACAO}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{VALOR_INICIAL}}'}</span>
              <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">{'{{PERCENTUAL_EXITO}}'}</span>
            </div>
          </div>

          <div className="bg-white text-black rounded-lg overflow-hidden min-h-[400px]">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules}
              className="h-[350px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl">
            <Save className="w-5 h-5 mr-2" />
            Salvar Modelo
          </Button>
        </div>
      </div>
    </div>
  );
}
