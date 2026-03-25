import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Search, ShieldPlus, ShieldMinus, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

const AVAILABLE_ROLES = ["admin", "provider", "user"] as const;

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  provider: "secondary",
  user: "outline",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        body: { method: "list" },
      });
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddRole = async (userId: string, role: string) => {
    setActionLoading(`add-${userId}-${role}`);
    try {
      const { error } = await supabase.functions.invoke("admin-manage-users", {
        body: { method: "add_role", user_id: userId, role },
      });
      if (error) throw error;
      toast({ title: "Rôle ajouté", description: `Rôle "${role}" ajouté avec succès.` });
      await fetchUsers();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    setActionLoading(`remove-${userId}-${role}`);
    try {
      const { error } = await supabase.functions.invoke("admin-manage-users", {
        body: { method: "remove_role", user_id: userId, role },
      });
      if (error) throw error;
      toast({ title: "Rôle retiré", description: `Rôle "${role}" retiré avec succès.` });
      await fetchUsers();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.roles.some((r) => r.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <SEO title="Gestion des utilisateurs" description="Gérer les rôles des utilisateurs" path="/admin/users" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Gestion des utilisateurs
            </h1>
            <p className="text-muted-foreground">
              {users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Utilisateurs & Rôles</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email ou rôle..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôles</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} variant={roleBadgeVariant[role] || "outline"}>
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground italic">Aucun rôle</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString("fr-FR")
                            : "Jamais"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {/* Add role */}
                            <AddRoleAction
                              user={user}
                              loading={actionLoading}
                              onAdd={handleAddRole}
                            />
                            {/* Remove role */}
                            {user.roles.map((role) => (
                              <AlertDialog key={role}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    disabled={actionLoading === `remove-${user.id}-${role}`}
                                  >
                                    {actionLoading === `remove-${user.id}-${role}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <ShieldMinus className="h-4 w-4" />
                                    )}
                                    <span className="ml-1 hidden sm:inline">{role}</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Retirer le rôle « {role} » ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action va retirer le rôle « {role} » à {user.email}. L'utilisateur
                                      perdra les accès liés à ce rôle.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveRole(user.id, role)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Retirer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AddRoleAction({
  user,
  loading,
  onAdd,
}: {
  user: UserWithRoles;
  loading: string | null;
  onAdd: (userId: string, role: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const availableRoles = AVAILABLE_ROLES.filter((r) => !user.roles.includes(r));

  if (availableRoles.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue placeholder="Ajouter..." />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedRole && (
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          disabled={loading === `add-${user.id}-${selectedRole}`}
          onClick={() => {
            onAdd(user.id, selectedRole);
            setSelectedRole("");
          }}
        >
          {loading === `add-${user.id}-${selectedRole}` ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldPlus className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
