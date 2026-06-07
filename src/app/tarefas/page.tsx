"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CRMClient, CRMTask } from '@/types/crm';
import { Kanban, List, CheckCircle2, Circle, AlertCircle, Clock, Calendar, User, Edit2, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type GlobalTask = CRMTask & { clientId: string; clientName: string };

export default function TarefasPage() {
    const [viewMode, setViewMode] = useState<"KANBAN" | "LIST">("KANBAN");
    const [tasks, setTasks] = useState<GlobalTask[]>([]);
    const [clients, setClients] = useState<CRMClient[]>([]);

    // Edit Modal State
    const [editingTask, setEditingTask] = useState<GlobalTask | null>(null);
    const [creatingTask, setCreatingTask] = useState<Partial<GlobalTask> | null>(null);

    const openCreateModal = () => {
        setCreatingTask({
            title: "",
            description: "",
            clientId: clients.length > 0 ? clients[0].id : "",
            assignee: "",
            dueDate: new Date().toISOString(),
            status: "TODO",
            priority: "MEDIUM"
        });
    };

    const handleCreateTask = () => {
        if (!creatingTask?.title || !creatingTask?.clientId) {
            toast.error("Título e Cliente são obrigatórios.");
            return;
        }

        const newTask: CRMTask = {
            id: crypto.randomUUID(),
            title: creatingTask.title,
            description: creatingTask.description || "",
            dueDate: creatingTask.dueDate || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            assignee: creatingTask.assignee || "Usuário",
            status: creatingTask.status as any || "TODO",
            priority: creatingTask.priority as any || "MEDIUM"
        };

        const client = clients.find(c => c.id === creatingTask.clientId);
        if (!client) return;

        const newClients = clients.map(c => {
            if (c.id === creatingTask.clientId) {
                return { ...c, tasks: [...(c.tasks || []), newTask] };
            }
            return c;
        });

        localStorage.setItem("ajuri_crm_clients", JSON.stringify(newClients));
        setClients(newClients);

        const globalTask: GlobalTask = { ...newTask, clientId: client.id, clientName: client.name };
        setTasks(prev => [...prev, globalTask]);

        setCreatingTask(null);
        toast.success("Tarefa criada com sucesso!");
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = () => {
        try {
            const data = localStorage.getItem("ajuri_crm_clients");
            if (data) {
                const parsedClients: CRMClient[] = JSON.parse(data);
                setClients(parsedClients);
                
                let all: GlobalTask[] = [];
                parsedClients.forEach(c => {
                    if (c.tasks && c.tasks.length > 0) {
                        c.tasks.forEach(t => {
                            all.push({ ...t, clientId: c.id, clientName: c.name });
                        });
                    }
                });
                setTasks(all);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const saveTaskToClient = (updatedTask: GlobalTask) => {
        try {
            const newClients = clients.map(client => {
                if (client.id === updatedTask.clientId) {
                    return {
                        ...client,
                        tasks: client.tasks.map(t => t.id === updatedTask.id ? {
                            id: updatedTask.id,
                            title: updatedTask.title,
                            description: updatedTask.description,
                            dueDate: updatedTask.dueDate,
                            createdAt: updatedTask.createdAt,
                            assignee: updatedTask.assignee,
                            status: updatedTask.status,
                            priority: updatedTask.priority
                        } : t)
                    };
                }
                return client;
            });
            localStorage.setItem("ajuri_crm_clients", JSON.stringify(newClients));
            setClients(newClients);
            
            // Update local tasks
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        } catch (e) {
            console.error(e);
            toast.error("Erro ao salvar tarefa.");
        }
    };

    const deleteTaskFromClient = (task: GlobalTask) => {
        if (!confirm("Deseja realmente excluir esta tarefa?")) return;

        try {
            const newClients = clients.map(client => {
                if (client.id === task.clientId) {
                    return {
                        ...client,
                        tasks: client.tasks.filter(t => t.id !== task.id)
                    };
                }
                return client;
            });
            localStorage.setItem("ajuri_crm_clients", JSON.stringify(newClients));
            setClients(newClients);
            setTasks(prev => prev.filter(t => t.id !== task.id));
            toast.success("Tarefa excluída.");
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatusChange = (taskId: string, newStatus: CRMTask["status"]) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            saveTaskToClient({ ...task, status: newStatus });
        }
    };

    // Drag and Drop
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, newStatus: CRMTask["status"]) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
            handleStatusChange(taskId, newStatus);
        }
    };

    const columns: { id: CRMTask["status"]; label: string; color: string }[] = [
        { id: "TODO", label: "A Fazer", color: "bg-amber-500" },
        { id: "IN_PROGRESS", label: "Em Progresso", color: "bg-blue-500" },
        { id: "DONE", label: "Concluído", color: "bg-emerald-500" },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Quadro de Tarefas</h1>
                    <p className="text-zinc-400">Gerencie todas as tarefas dos seus clientes em um só lugar.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={openCreateModal}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl px-4 gap-2 font-bold"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Nova Tarefa
                    </Button>
                    <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                        <Button 
                            variant="ghost" 
                            size="sm"
                        className={cn("rounded-lg px-4 gap-2", viewMode === "KANBAN" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white")}
                        onClick={() => setViewMode("KANBAN")}
                    >
                        <Kanban className="w-4 h-4" />
                        Kanban
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn("rounded-lg px-4 gap-2", viewMode === "LIST" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white")}
                        onClick={() => setViewMode("LIST")}
                    >
                        <List className="w-4 h-4" />
                        Lista
                    </Button>
                    </div>
                </div>
            </div>

            {/* KANBAN VIEW */}
            {viewMode === "KANBAN" && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-6 h-full min-w-max pb-4">
                        {columns.map(col => {
                            const colTasks = tasks.filter(t => 
                                t.status === col.id || 
                                (col.id === "TODO" && t.status === "PENDING") ||
                                (col.id === "DONE" && t.status === "COMPLETED")
                            );
                            
                            return (
                                <div 
                                    key={col.id} 
                                    className="w-[350px] flex flex-col bg-zinc-900/40 rounded-2xl border border-white/5 overflow-hidden"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                >
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full", col.color)} />
                                            <h3 className="font-bold text-white">{col.label}</h3>
                                        </div>
                                        <Badge variant="secondary" className="bg-white/5 text-zinc-300 border-white/10">
                                            {colTasks.length}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                        {colTasks.map(task => (
                                            <div 
                                                key={task.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                onClick={() => setEditingTask(task)}
                                                className="bg-zinc-950 p-4 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all cursor-grab active:cursor-grabbing group hover:shadow-lg shadow-black/50"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-zinc-400">
                                                        {task.clientName}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="w-6 h-6 text-zinc-500 hover:text-emerald-400" onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}>
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="w-6 h-6 text-zinc-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); deleteTaskFromClient(task); }}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <h4 className={cn("font-semibold mb-1", task.status === "DONE" || task.status === "COMPLETED" ? "text-zinc-500 line-through" : "text-zinc-100")}>
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{task.description}</p>
                                                )}
                                                
                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                                    <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span className="truncate max-w-[80px]">{task.assignee}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === "LIST" && (
                <div className="flex-1 overflow-auto bg-zinc-900/40 rounded-2xl border border-white/5">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-zinc-400 text-xs uppercase sticky top-0 backdrop-blur-xl z-10">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tarefa</th>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold">Responsável</th>
                                <th className="px-6 py-4 font-semibold">Deadline</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tasks.map(task => (
                                <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-zinc-100">{task.title}</div>
                                        {task.description && <div className="text-xs text-zinc-500 truncate max-w-[300px] mt-1">{task.description}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-zinc-950 border-white/10 text-zinc-300">
                                            {task.clientName}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-zinc-500" />
                                            {task.assignee}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-500" />
                                            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={task.status === "COMPLETED" ? "DONE" : task.status === "PENDING" ? "TODO" : task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                                            className={cn("text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:ring-0 outline-none appearance-none text-center", 
                                                (task.status === "DONE" || task.status === "COMPLETED") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                                task.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            )}
                                        >
                                            <option value="TODO" className="bg-zinc-900 text-white">A Fazer</option>
                                            <option value="IN_PROGRESS" className="bg-zinc-900 text-white">Em Progresso</option>
                                            <option value="DONE" className="bg-zinc-900 text-white">Concluído</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10" onClick={() => setEditingTask(task)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => deleteTaskFromClient(task)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tasks.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            Nenhuma tarefa encontrada.
                        </div>
                    )}
                </div>
            )}

            {/* EDIT MODAL */}
            <AnimatePresence>
                {editingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-950 border border-white/10 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Editar Tarefa</h2>
                                    <p className="text-xs text-zinc-400 mt-1">Cliente: {editingTask.clientName}</p>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Título</label>
                                    <Input 
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                                        className="bg-zinc-900/50 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Descrição</label>
                                    <textarea 
                                        value={editingTask.description || ""}
                                        onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-3 text-sm text-white resize-none min-h-[100px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Responsável</label>
                                        <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/10 rounded-lg px-3 h-10">
                                            <User className="w-4 h-4 text-zinc-500" />
                                            <Input 
                                                value={editingTask.assignee || ""}
                                                onChange={(e) => setEditingTask({...editingTask, assignee: e.target.value})}
                                                className="border-none bg-transparent px-0 focus-visible:ring-0 text-white shadow-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Deadline</label>
                                        <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/10 rounded-lg px-3 h-10">
                                            <Calendar className="w-4 h-4 text-zinc-500" />
                                            <Input 
                                                type="date"
                                                value={editingTask.dueDate.split('T')[0]}
                                                onChange={(e) => setEditingTask({...editingTask, dueDate: new Date(e.target.value).toISOString()})}
                                                className="border-none bg-transparent px-0 focus-visible:ring-0 text-white shadow-none [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Status</label>
                                    <select 
                                        value={editingTask.status === "COMPLETED" ? "DONE" : editingTask.status === "PENDING" ? "TODO" : editingTask.status}
                                        onChange={(e) => setEditingTask({...editingTask, status: e.target.value as any})}
                                        className="w-full h-10 bg-zinc-900/50 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="TODO">A Fazer</option>
                                        <option value="IN_PROGRESS">Em Progresso</option>
                                        <option value="DONE">Concluído</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/5 flex items-center justify-end gap-3 bg-zinc-900/50">
                                <Button variant="ghost" onClick={() => setEditingTask(null)} className="text-zinc-400 hover:text-white">
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={() => {
                                        saveTaskToClient(editingTask);
                                        setEditingTask(null);
                                        toast.success("Tarefa salva com sucesso!");
                                    }}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    Salvar Alterações
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {creatingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-950 border border-white/10 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Nova Tarefa</h2>
                                    <p className="text-xs text-zinc-400 mt-1">Crie uma tarefa e vincule a um cliente</p>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Título da Tarefa</label>
                                    <Input 
                                        value={creatingTask.title || ""}
                                        onChange={(e) => setCreatingTask({...creatingTask, title: e.target.value})}
                                        className="bg-zinc-900/50 border-white/10 text-white"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Vincular Cliente</label>
                                    <select 
                                        value={creatingTask.clientId || ""}
                                        onChange={(e) => setCreatingTask({...creatingTask, clientId: e.target.value})}
                                        className="w-full h-10 bg-zinc-900/50 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="" disabled>Selecione um cliente...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Descrição</label>
                                    <textarea 
                                        value={creatingTask.description || ""}
                                        onChange={(e) => setCreatingTask({...creatingTask, description: e.target.value})}
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-3 text-sm text-white resize-none min-h-[80px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Responsável</label>
                                        <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/10 rounded-lg px-3 h-10">
                                            <User className="w-4 h-4 text-zinc-500" />
                                            <Input 
                                                value={creatingTask.assignee || ""}
                                                onChange={(e) => setCreatingTask({...creatingTask, assignee: e.target.value})}
                                                className="border-none bg-transparent px-0 focus-visible:ring-0 text-white shadow-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Deadline</label>
                                        <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/10 rounded-lg px-3 h-10">
                                            <Calendar className="w-4 h-4 text-zinc-500" />
                                            <Input 
                                                type="date"
                                                value={creatingTask.dueDate ? creatingTask.dueDate.split('T')[0] : ""}
                                                onChange={(e) => setCreatingTask({...creatingTask, dueDate: new Date(e.target.value).toISOString()})}
                                                className="border-none bg-transparent px-0 focus-visible:ring-0 text-white shadow-none [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/5 flex items-center justify-end gap-3 bg-zinc-900/50">
                                <Button variant="ghost" onClick={() => setCreatingTask(null)} className="text-zinc-400 hover:text-white">
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleCreateTask}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                                >
                                    Criar Tarefa
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
