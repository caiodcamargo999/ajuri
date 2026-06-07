"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";
import { CustomTemplateEditor, CustomTemplate, STORAGE_KEY_TEMPLATES } from "./CustomTemplateEditor";

export function TemplateManager() {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<CustomTemplate | null>(null);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [isEditing]); // Reload when coming back from editor

  const handleDelete = (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este modelo?")) return;
    try {
      const updated = templates.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(updated));
      setTemplates(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (template: CustomTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentTemplate(null);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <CustomTemplateEditor 
        editingTemplate={currentTemplate} 
        onBack={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Meus Modelos de Petição</CardTitle>
            <CardDescription>Crie, edite e gerencie seus próprios templates personalizados de documentos.</CardDescription>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Novo Modelo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Nenhum modelo cadastrado</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">Você pode criar modelos de petições personalizados fazendo upload de arquivos .docx ou usando nosso editor de texto rico.</p>
            <Button onClick={handleCreate} variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-xl">
              Criar Primeiro Modelo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div key={template.id} className="border border-zinc-800 bg-zinc-900/50 rounded-xl p-5 hover:border-blue-500/50 transition-colors group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="w-8 h-8 bg-zinc-950 text-zinc-400 hover:text-white" onClick={() => handleEdit(template)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 bg-zinc-950 text-red-400 hover:text-red-300" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <FileText className="w-8 h-8 text-blue-400 mb-4" />
                <h4 className="font-bold text-lg mb-1 truncate pr-16" title={template.title}>{template.title}</h4>
                <p className="text-xs text-zinc-500">
                  Criado em: {new Date(template.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
