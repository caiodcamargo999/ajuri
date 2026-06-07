"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, ImageIcon, Save, Trash2, Plus, Check, MapPin, Mail, Phone, Palette as PaletteIcon, User } from "lucide-react";
import { OfficeData, EMPTY_OFFICE, DEFAULT_OFFICE, BrandingProfile } from "@/types/petition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Chaves para o LocalStorage
export const STORAGE_KEYS = {
  PROFILES: "ajuri_branding_profiles",
  ACTIVE_ID: "ajuri_active_profile_id",
  OFFICE_DATA: "ajuri_office_data",
  LOGO_IMAGE: "ajuri_logo_image",
};

export function BrandingSettings() {
  const [profiles, setProfiles] = useState<BrandingProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<BrandingProfile | null>(null);

  const [officeData, setOfficeData] = useState<OfficeData>(EMPTY_OFFICE);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar dados ao montar
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
        const storedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);

        let loadedProfiles: BrandingProfile[] = [];
        let activeId: string | null = null;

        if (storedProfiles) {
          loadedProfiles = JSON.parse(storedProfiles);
          activeId = storedActiveId;
        } else {
          const oldOffice = localStorage.getItem(STORAGE_KEYS.OFFICE_DATA);
          const oldLogo = localStorage.getItem(STORAGE_KEYS.LOGO_IMAGE);

          if (oldOffice) {
            const defaultProfile: BrandingProfile = {
              id: "default",
              profileName: "Modelo Padrão",
              officeData: JSON.parse(oldOffice),
              logoImage: oldLogo,
              headerImage: null,
              createdAt: new Date().toISOString(),
            };
            loadedProfiles = [defaultProfile];
            activeId = "default";
          } else {
            const initialProfile: BrandingProfile = {
              id: "default",
              profileName: "Meu Escritório",
              officeData: EMPTY_OFFICE,
              logoImage: null,
              headerImage: null,
              createdAt: new Date().toISOString(),
            };
            loadedProfiles = [initialProfile];
            activeId = "default";
          }

          localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(loadedProfiles));
          localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeId || "default");
        }

        setProfiles(loadedProfiles);
        setActiveProfileId(activeId);

        if (loadedProfiles.length > 0) {
          const active = loadedProfiles.find(p => p.id === activeId) || loadedProfiles[0];
          if (active) {
            setEditingProfile(active);
            setOfficeData(active.officeData);
            setLogoImage(active.logoImage);
            setHeaderImage(active.headerImage || null);
          }
        } else {
          setEditingProfile(null);
          setOfficeData(EMPTY_OFFICE);
          setLogoImage(null);
          setHeaderImage(null);
        }

      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfficeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFunction: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. O limite é 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFunction(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (setFunction: (val: null) => void) => {
    setFunction(null);
  };

  const handleSelectProfile = (profile: BrandingProfile | null) => {
    if (!profile) {
      setEditingProfile(null);
      setOfficeData(EMPTY_OFFICE);
      setLogoImage(null);
      setHeaderImage(null);
      setActiveProfileId(null);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
      return;
    }
    setEditingProfile(profile);
    setOfficeData(profile.officeData);
    setLogoImage(profile.logoImage);
    setHeaderImage(profile.headerImage || null);
    setActiveProfileId(profile.id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, profile.id);
  };

  const handleCreateNew = () => {
    setEditingProfile(null);
    setOfficeData(EMPTY_OFFICE);
    setLogoImage(null);
    setHeaderImage(null);
    setIsDialogOpen(true);
    setNewProfileName("");
  };

  const saveProfile = (name?: string, asNew: boolean = false) => {
    try {
      let updatedProfiles = [...profiles];
      let currentId = asNew ? null : editingProfile?.id;
      let finalName = name || (asNew ? "" : editingProfile?.profileName) || "Modelo Sem Nome";

      if (!currentId) {
        currentId = crypto.randomUUID();
        const newProfile: BrandingProfile = {
          id: currentId,
          profileName: finalName || "Novo Modelo",
          officeData: officeData,
          logoImage: logoImage,
          headerImage: headerImage,
          createdAt: new Date().toISOString(),
        };
        updatedProfiles.push(newProfile);
        setEditingProfile(newProfile);
      } else {
        updatedProfiles = updatedProfiles.map(p =>
          p.id === currentId
            ? { ...p, officeData, logoImage, headerImage, profileName: finalName }
            : p
        );
      }

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
      setActiveProfileId(currentId);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, currentId);

      toast.success(asNew ? "Novo modelo criado!" : "Modelo atualizado com sucesso.");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar. Verifique se a imagem não é muito pesada.");
    }
  };

  const deleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const updated = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated));
    setProfiles(updated);

    if (activeProfileId === id) {
      const next = updated[0] || null;
      handleSelectProfile(next);
    }

    toast.info("Perfil removido.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar de Perfis */}
      <Card className="lg:col-span-3 border border-white/5 bg-zinc-950/40 backdrop-blur-xl shadow-2xl h-fit sticky top-24">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Meus Modelos</h3>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500" onClick={handleCreateNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-2 pt-0">
          <AnimatePresence>
            {profiles.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleSelectProfile(p)}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                  activeProfileId === p.id
                    ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden",
                  activeProfileId === p.id ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20" : "bg-white/5 text-zinc-500"
                )}>
                  {p.logoImage ? (
                    <img src={p.logoImage} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    p.profileName.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-bold truncate tracking-tight transition-colors", activeProfileId === p.id ? "text-white" : "text-zinc-400")}>{p.profileName}</p>
                  <p className="text-[10px] text-zinc-600 font-medium font-mono uppercase">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {activeProfileId === p.id && <Check className="h-4 w-4 text-emerald-500 shrink-0" />}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500 rounded-lg"
                  onClick={(e) => deleteProfile(p.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Editor do Perfil */}
      <div className="lg:col-span-9 space-y-8">
        <Card className="border border-white/5 bg-zinc-950/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

          <CardHeader className="border-b border-white/5 bg-white/5 pb-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <ImageIcon className="w-5 h-5 text-emerald-500" />
              </div>
              Configuração Visual
            </CardTitle>
            <CardDescription className="text-zinc-500 font-medium">
              Personalize como seu escritório é apresentado nos documentos oficiais gerados pela AJURI X.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-12 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Nome do Advogado / Escritório
                </Label>
                <Input
                  name="name"
                  value={officeData.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo ou Razão Social..."
                  className="bg-black/40 border-white/5 h-12 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" /> Números da OAB
                </Label>
                <Input
                  name="oabNumbers"
                  value={officeData.oabNumbers}
                  onChange={handleInputChange}
                  placeholder="Ex: OAB/AM 00.000..."
                  className="bg-black/40 border-white/5 h-12 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all font-medium"
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Endereço Principal
                </Label>
                <Input
                  name="address"
                  value={officeData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, Número, Bairro..."
                  className="bg-black/40 border-white/5 h-12 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2">
                <div className="col-span-1 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cidade</Label>
                  <Input name="city" value={officeData.city} onChange={handleInputChange} className="bg-black/40 border-white/5 h-12 rounded-xl transition-all" />
                </div>
                <div className="col-span-1 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estado</Label>
                  <Input name="state" value={officeData.state} onChange={handleInputChange} className="bg-black/40 border-white/5 h-12 rounded-xl transition-all" />
                </div>
                <div className="col-span-1 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">CEP</Label>
                  <Input name="cep" value={officeData.cep} onChange={handleInputChange} className="bg-black/40 border-white/5 h-12 rounded-xl transition-all" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email Profissional
                </Label>
                <Input name="email" type="email" value={officeData.email} onChange={handleInputChange} className="bg-black/40 border-white/5 h-12 rounded-xl transition-all font-medium" />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Telefone / WhatsApp
                </Label>
                <Input name="phone" value={officeData.phone} onChange={handleInputChange} className="bg-black/40 border-white/5 h-12 rounded-xl transition-all font-medium" />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <PaletteIcon className="w-3.5 h-3.5" /> Cor de Identidade
                </Label>
                <div className="flex gap-3">
                  <div className="relative group">
                    <Input
                      name="primaryColor"
                      type="color"
                      value={officeData.primaryColor || "#10b981"}
                      onChange={handleInputChange}
                      className="h-12 w-16 p-1 bg-black/40 border-white/5 rounded-xl cursor-pointer"
                    />
                  </div>
                  <Input
                    name="primaryColor"
                    value={officeData.primaryColor || "#10b981"}
                    onChange={handleInputChange}
                    placeholder="#10B981"
                    className="flex-1 bg-black/40 border-white/5 h-12 rounded-xl font-mono text-zinc-400 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Logo do Escritório</Label>
              <div className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all relative min-h-[300px] cursor-pointer group/upload overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleImageUpload(e, setLogoImage)}
                />

                {logoImage ? (
                  <div className="relative w-full max-w-[400px] z-20 pointer-events-none group/logo-preview">
                    <img src={logoImage} alt="Logo" className="w-full h-auto rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-4 -right-4 h-10 w-10 rounded-full pointer-events-auto shadow-2xl scale-0 group-hover/logo-preview:scale-100 transition-transform active:scale-90"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeImage(setLogoImage);
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 py-4">
                    <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-300">
                      <Upload className="h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-black text-white tracking-tight">Toque ou arraste sua logo</p>
                      <p className="text-sm text-zinc-500 font-medium">Recomendamos PNG com fundo transparente (&lt; 2MB)</p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-4 p-4 md:p-8 border-t border-white/5 bg-white/5">
            <Button
              variant="outline"
              onClick={() => {
                setNewProfileName("");
                setIsDialogOpen(true);
              }}
              className="rounded-xl px-8 border-white/10 hover:bg-white/5 transition-all font-bold h-12"
            >
              Salvar como Novo
            </Button>
            <Button onClick={() => saveProfile()} className="rounded-xl px-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 shadow-xl shadow-emerald-900/40 transition-all active:scale-95 group">
              <Save className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Salvar Alterações
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Dialog para Nome do Perfil */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-8 shadow-[0_20px_100px_rgba(0,0,0,0.8)]">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-black tracking-tight">Nova Customização</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium">
              Dê um nome para este modelo de identidade visual.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input
              placeholder="Ex: Escritório Principal, Parceria Wallacy..."
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="h-12 bg-black border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 font-medium"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && saveProfile(newProfileName, true)}
            />
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl hover:bg-white/5 font-bold">Cancelar</Button>
            <Button onClick={() => saveProfile(newProfileName, true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold px-8 shadow-lg shadow-emerald-900/20 transition-all">Criar Modelo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
