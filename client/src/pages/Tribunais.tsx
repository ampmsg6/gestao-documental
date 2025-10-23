import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Folder, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Tribunais() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tribunal: "",
    local: "",
    numeroProcesso: "",
    juizo: "",
    tipoAcao: "",
  });

  const utils = trpc.useUtils();
  const { data: folders, isLoading } = trpc.folders.getByType.useQuery({ type: "tribunais" });
  const createFolder = trpc.folders.create.useMutation({
    onSuccess: () => {
      utils.folders.invalidate();
      setOpen(false);
      setFormData({ name: "", tribunal: "", local: "", numeroProcesso: "", juizo: "", tipoAcao: "" });
      toast.success("Processo judicial criado com sucesso");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFolder.mutate({ ...formData, type: "tribunais" });
  };

  const mainFolders = folders?.filter(f => !f.parentId) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Processos Judiciais</h1>
            <p className="text-muted-foreground mt-2">Gerir processos em tribunais</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Processo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Processo Judicial</DialogTitle>
                  <DialogDescription>Preencha os dados do processo judicial</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Processo *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tribunal">Tribunal</Label>
                    <Input id="tribunal" value={formData.tribunal} onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="local">Local</Label>
                    <Input id="local" value={formData.local} onChange={(e) => setFormData({ ...formData, local: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numeroProcesso">Número do Processo</Label>
                    <Input id="numeroProcesso" value={formData.numeroProcesso} onChange={(e) => setFormData({ ...formData, numeroProcesso: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="juizo">Juízo</Label>
                    <Input id="juizo" value={formData.juizo} onChange={(e) => setFormData({ ...formData, juizo: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipoAcao">Tipo de Ação</Label>
                    <Input id="tipoAcao" value={formData.tipoAcao} onChange={(e) => setFormData({ ...formData, tipoAcao: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createFolder.isPending}>{createFolder.isPending ? "A criar..." : "Criar Processo"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">A carregar processos...</p></div>
        ) : mainFolders.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum processo criado</p>
            <p className="text-sm text-muted-foreground mt-2">Clique em "Novo Processo" para começar</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mainFolders.map((folder) => (
              <Link key={folder.id} href={`/folder/${folder.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Folder className="h-5 w-5 text-blue-600" />{folder.name}</CardTitle>
                    <CardDescription>{folder.numeroProcesso && `Processo: ${folder.numeroProcesso}`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      {folder.tribunal && <p className="text-muted-foreground"><span className="font-medium">Tribunal:</span> {folder.tribunal}</p>}
                      {folder.tipoAcao && <p className="text-muted-foreground"><span className="font-medium">Tipo:</span> {folder.tipoAcao}</p>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
