"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRoleUsersAction } from "@/actions/get-role-users";
import { getUsersAction } from "@/actions/get-users";
import { assignUserRoleAction } from "@/actions/assign-user-role";
import { removeUserRoleAction } from "@/actions/remove-user-role";
import { cn } from "@/lib/utils";

type Role = {
  id: string;
  name: string;
  organizationId: string;
};

type Member = {
  userId: string;
  userName: string;
  userEmail: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type RoleUsersDialogProps = {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RoleUsersDialog({
  role,
  open,
  onOpenChange,
}: RoleUsersDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { execute: fetchRoleUsers } = useAction(getRoleUsersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setMembers(data.data);
      }
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar usuários da role");
      setIsLoading(false);
    },
  });

  const { execute: fetchUsers } = useAction(getUsersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) {
        setUsers(data.data);
      }
    },
    onError: () => {
      toast.error("Erro ao carregar usuários");
    },
  });

  const { execute: assignUser, isExecuting: isAssigning } = useAction(
    assignUserRoleAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success("Role atribuída com sucesso!");
          setSelectedUserId("");
          if (role) {
            setIsLoading(true);
            fetchRoleUsers({ roleId: role.id });
          }
          window.dispatchEvent(new Event("role-changed"));
        } else if (data?.error) {
          toast.error(data.error);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao atribuir role");
      },
    },
  );

  const { execute: removeUser } = useAction(removeUserRoleAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Role removida do usuário");
        if (role) {
          setIsLoading(true);
          fetchRoleUsers({ roleId: role.id });
        }
        window.dispatchEvent(new Event("role-changed"));
      }
    },
    onError: () => toast.error("Erro ao remover role"),
  });

  useEffect(() => {
    if (open && role) {
      setIsLoading(true);
      setSelectedUserId("");
      fetchRoleUsers({ roleId: role.id });
      fetchUsers({});
    }

    if (!open) {
      setMembers([]);
      setUsers([]);
      setSelectedUserId("");
      setIsLoading(false);
    }
    // fetchRoleUsers/fetchUsers são estáveis o suficiente para recarregar ao abrir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, role?.id]);

  const availableUsers = users.filter(
    (user) => !members.some((member) => member.userId === user.id),
  );

  const handleAssign = () => {
    if (!role || !selectedUserId) {
      toast.error("Selecione um usuário");
      return;
    }
    assignUser({ userId: selectedUserId, roleId: role.id });
  };

  const selectClassName = cn(
    "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Usuários da role</DialogTitle>
          <DialogDescription>
            {role?.name
              ? `Gerencie os usuários com a role ${role.name}`
              : "Gerencie os usuários vinculados"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label>Adicionar usuário</Label>
              <select
                className={selectClassName}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Selecione um usuário</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && !isLoading && (
                <p className="text-xs text-muted-foreground">
                  Nenhum usuário cadastrado no sistema.
                </p>
              )}
            </div>
            <Button
              onClick={handleAssign}
              disabled={isAssigning || !selectedUserId}
            >
              Atribuir
            </Button>
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground py-6 text-center"
                      >
                        Nenhum usuário com esta role
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell className="font-medium">
                          {member.userName}
                        </TableCell>
                        <TableCell>{member.userEmail}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              role &&
                              removeUser({
                                userId: member.userId,
                                roleId: role.id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
