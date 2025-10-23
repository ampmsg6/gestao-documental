import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Folder, Gavel, Scale } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { data: folders } = trpc.folders.list.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery();

  const tribunaisCount = folders?.filter(f => f.type === "tribunais" && !f.parentId).length || 0;
  const pareceresCount = folders?.filter(f => f.type === "pareceres" && !f.parentId).length || 0;
  const outrosCount = folders?.filter(f => f.type === "outros_assuntos" && !f.parentId).length || 0;
  const honorariosCount = folders?.filter(f => f.type === "honorarios" && !f.parentId).length || 0;
  const unreadNotifications = notifications?.filter(n => n.read === "no").length || 0;

  const stats = [
    { name: "Processos Judiciais", value: tribunaisCount, icon: Gavel, href: "/tribunais", color: "text-blue-600" },
    { name: "Pareceres", value: pareceresCount, icon: FileText, href: "/pareceres", color: "text-green-600" },
    { name: "Outros Assuntos", value: outrosCount, icon: Folder, href: "/outros-assuntos", color: "text-purple-600" },
    { name: "Honorários", value: honorariosCount, icon: Scale, href: "/honorarios", color: "text-orange-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.name}</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão Documental ATMJ Legal
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.name} href={stat.href}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.name}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.value === 1 ? "pasta ativa" : "pastas ativas"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {unreadNotifications > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Notificações Recentes</CardTitle>
              <CardDescription>
                Tem {unreadNotifications} {unreadNotifications === 1 ? "notificação não lida" : "notificações não lidas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications?.filter(n => n.read === "no").slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-4 p-3 rounded-lg bg-accent/50">
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>
              Navegue pelas principais áreas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <Link href="/tribunais">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                  <Gavel className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Tribunais</p>
                    <p className="text-sm text-muted-foreground">Gerir processos judiciais</p>
                  </div>
                </div>
              </Link>
              <Link href="/pareceres">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Pareceres</p>
                    <p className="text-sm text-muted-foreground">Solicitar e consultar pareceres</p>
                  </div>
                </div>
              </Link>
              <Link href="/outros-assuntos">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                  <Folder className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Outros Assuntos</p>
                    <p className="text-sm text-muted-foreground">Documentos gerais</p>
                  </div>
                </div>
              </Link>
              <Link href="/honorarios">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                  <Scale className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Honorários</p>
                    <p className="text-sm text-muted-foreground">Gestão financeira</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
