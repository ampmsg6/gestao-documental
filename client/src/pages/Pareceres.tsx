import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Pareceres() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", nomeParecer: "", description: "" });
  const utils = trpc.useUtils();
  const { data: folders, isLoading } = trpc.folders.getByType.useQuery({ type: "pareceres" });
  const createFolder = trpc.folders.create.useMutation({
    onSuccess: () => {
      utils.folders.invalidate();
      setOpen(false);
      setFormData({ name: "", nomeParecer: "", description: "" });
      toast.success("Parecer criado com sucesso");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFolder.mutate({ ...formData, type: "pareceres", dataParecer: new Date() });
  };

  const mainFolders = folders?.filter(f => !f.parentId) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pareceres</h1>
            <p className="text-muted-foreground mt-2">Solicitar e consultar pareceres jurídicos</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Parecer</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Solicitar Novo Parecer</DialogTitle>
                  <DialogDescription>Preencha os dados da solicitação</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Título *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nomeParecer">Nome do Parecer</Label>
                    <Input id="nomeParecer" value={formData.nomeParecer} onChange={(e) => setFormData({ ...formData, nomeParecer: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição / Perguntas</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createFolder.isPending}>{createFolder.isPending ? "A criar..." : "Criar Parecer"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">A carregar pareceres...</p></div>
        ) : mainFolders.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum parecer criado</p>
            <p className="text-sm text-muted-foreground mt-2">Clique em "Novo Parecer" para começar</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mainFolders.map((folder) => (
              <Link key={folder.id} href={`/folder/${folder.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" />{folder.name}</CardTitle>
                    <CardDescription>{folder.nomeParecer}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {folder.dataParecer && new Date(folder.dataParecer).toLocaleDateString('pt-PT')}
                    </p>
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
