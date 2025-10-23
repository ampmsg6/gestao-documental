import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function OutrosAssuntos() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const utils = trpc.useUtils();
  const { data: folders, isLoading } = trpc.folders.getByType.useQuery({ type: "outros_assuntos" });
  const createFolder = trpc.folders.create.useMutation({
    onSuccess: () => {
      utils.folders.invalidate();
      setOpen(false);
      setFormData({ name: "" });
      toast.success("Pasta criada com sucesso");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFolder.mutate({ ...formData, type: "outros_assuntos" });
  };

  const mainFolders = folders?.filter(f => !f.parentId) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Outros Assuntos</h1>
            <p className="text-muted-foreground mt-2">Documentos e comunicações gerais</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Pasta</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Criar Nova Pasta</DialogTitle>
                  <DialogDescription>Preencha o nome da pasta temática</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Pasta *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createFolder.isPending}>{createFolder.isPending ? "A criar..." : "Criar Pasta"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">A carregar pastas...</p></div>
        ) : mainFolders.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma pasta criada</p>
            <p className="text-sm text-muted-foreground mt-2">Clique em "Nova Pasta" para começar</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mainFolders.map((folder) => (
              <Link key={folder.id} href={`/folder/${folder.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-purple-600" />{folder.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
