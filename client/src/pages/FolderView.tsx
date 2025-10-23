import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { FileText, Link as LinkIcon, MessageSquare, Plus, Upload, Trash2, ExternalLink } from "lucide-react";
import { useState, useRef } from "react";
import { useRoute } from "wouter";
import { toast } from "sonner";

export default function FolderView() {
  const [, params] = useRoute("/folder/:id");
  const folderId = params?.id || "";
  
  const [uploadOpen, setUploadOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ name: "", description: "" });
  const [linkData, setLinkData] = useState({ name: "", url: "", platform: "onedrive", description: "" });
  const [comment, setComment] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const utils = trpc.useUtils();
  const { data: folder } = trpc.folders.getById.useQuery({ id: folderId });
  const { data: files } = trpc.files.listByFolder.useQuery({ folderId });
  const { data: comments } = trpc.comments.listByFolder.useQuery({ folderId });
  
  const uploadFile = trpc.files.upload.useMutation({
    onSuccess: () => {
      utils.files.invalidate();
      setUploadOpen(false);
      setUploadData({ name: "", description: "" });
      setSelectedFile(null);
      toast.success("Ficheiro carregado com sucesso");
    },
  });

  const shareLink = trpc.files.shareLink.useMutation({
    onSuccess: () => {
      utils.files.invalidate();
      setLinkOpen(false);
      setLinkData({ name: "", url: "", platform: "onedrive", description: "" });
      toast.success("Link partilhado com sucesso");
    },
  });

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.invalidate();
      setCommentOpen(false);
      setComment("");
      toast.success("Comentário adicionado");
    },
  });

  const deleteFile = trpc.files.delete.useMutation({
    onSuccess: () => {
      utils.files.invalidate();
      toast.success("Ficheiro removido");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadData({ ...uploadData, name: file.name });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (base64) {
        uploadFile.mutate({
          folderId,
          name: uploadData.name,
          fileData: base64,
          fileType: selectedFile.type,
          description: uploadData.description,
        });
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleShareLink = (e: React.FormEvent) => {
    e.preventDefault();
    shareLink.mutate({
      folderId,
      name: linkData.name,
      externalUrl: linkData.url,
      linkPlatform: linkData.platform as any,
      description: linkData.description,
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    createComment.mutate({ folderId, content: comment });
  };

  if (!folder) {
    return <DashboardLayout><div className="text-center py-12">Pasta não encontrada</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{folder.name}</h1>
          <div className="mt-2 space-y-1">
            {folder.tribunal && <p className="text-sm text-muted-foreground"><span className="font-medium">Tribunal:</span> {folder.tribunal}</p>}
            {folder.numeroProcesso && <p className="text-sm text-muted-foreground"><span className="font-medium">Processo:</span> {folder.numeroProcesso}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button><Upload className="h-4 w-4 mr-2" />Upload Ficheiro</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleUpload}>
                <DialogHeader>
                  <DialogTitle>Upload de Ficheiro</DialogTitle>
                  <DialogDescription>Carregar ficheiro para esta pasta</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Selecionar Ficheiro *</Label>
                    <Input type="file" ref={fileInputRef} onChange={handleFileSelect} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fileName">Nome do Ficheiro</Label>
                    <Input id="fileName" value={uploadData.name} onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fileDesc">Descrição</Label>
                    <Textarea id="fileDesc" value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={!selectedFile || uploadFile.isPending}>
                    {uploadFile.isPending ? "A carregar..." : "Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><LinkIcon className="h-4 w-4 mr-2" />Partilhar Link</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleShareLink}>
                <DialogHeader>
                  <DialogTitle>Partilhar Link Externo</DialogTitle>
                  <DialogDescription>OneDrive ou Google Drive</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="linkName">Nome *</Label>
                    <Input id="linkName" value={linkData.name} onChange={(e) => setLinkData({ ...linkData, name: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="linkUrl">URL *</Label>
                    <Input id="linkUrl" type="url" value={linkData.url} onChange={(e) => setLinkData({ ...linkData, url: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="platform">Plataforma</Label>
                    <Select value={linkData.platform} onValueChange={(v) => setLinkData({ ...linkData, platform: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onedrive">OneDrive</SelectItem>
                        <SelectItem value="googledrive">Google Drive</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="linkDesc">Descrição</Label>
                    <Textarea id="linkDesc" value={linkData.description} onChange={(e) => setLinkData({ ...linkData, description: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={shareLink.isPending}>
                    {shareLink.isPending ? "A partilhar..." : "Partilhar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" />Comentar</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleComment}>
                <DialogHeader>
                  <DialogTitle>Adicionar Comentário</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCommentOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createComment.isPending}>Adicionar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="files">
          <TabsList>
            <TabsTrigger value="files">Ficheiros ({files?.length || 0})</TabsTrigger>
            <TabsTrigger value="comments">Comentários ({comments?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            {!files || files.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Sem ficheiros</CardContent></Card>
            ) : (
              files.map((file) => (
                <Card key={file.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {file.type === "upload" ? <FileText className="h-5 w-5 mt-0.5" /> : <LinkIcon className="h-5 w-5 mt-0.5" />}
                        <div>
                          <CardTitle className="text-base">{file.name}</CardTitle>
                          {file.description && <CardDescription>{file.description}</CardDescription>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.uploadedAt && new Date(file.uploadedAt).toLocaleString('pt-PT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {file.type === "link" && file.externalUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={file.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {file.type === "upload" && file.fileUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteFile.mutate({ id: file.id })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {!comments || comments.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Sem comentários</CardContent></Card>
            ) : (
              comments.map((c) => (
                <Card key={c.id}>
                  <CardContent className="pt-6">
                    <p>{c.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {c.createdAt && new Date(c.createdAt).toLocaleString('pt-PT')}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
