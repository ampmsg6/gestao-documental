import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Shield } from "lucide-react";

export default function Auditoria() {
  const { data: logs, isLoading } = trpc.audit.list.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
          <p className="text-muted-foreground mt-2">Logs de atividade do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Registos de Auditoria
            </CardTitle>
            <CardDescription>Últimas 100 atividades registadas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12"><p className="text-muted-foreground">A carregar logs...</p></div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-center py-12"><p className="text-muted-foreground">Sem registos de auditoria</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString('pt-PT') : '-'}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.entityType}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
