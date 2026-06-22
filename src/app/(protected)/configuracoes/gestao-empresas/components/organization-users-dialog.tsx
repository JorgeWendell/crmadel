"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getOrganizationUsersAction } from "@/actions/get-organization-users";
import { getUsersAction } from "@/actions/get-users";
import { assignUserOrganizationAction } from "@/actions/assign-user-organization";
import { removeUserOrganizationAction } from "@/actions/remove-user-organization";
import { cn } from "@/lib/utils";

type Organization = {
  id: string;
  name: string;
};

type Member = {
  userId: string;
  userName: string;
  userEmail: string;
  isOwner: boolean;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type OrganizationUsersDialogProps = {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrganizationUsersDialog({
  organization,
  open,
  onOpenChange,
}: OrganizationUsersDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { execute: fetchMembers } = useAction(getOrganizationUsersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setMembers(data.data);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Erro ao carregar usuários da empresa");
      setIsLoading(false);
    },
  });

  const { execute: fetchUsers } = useAction(getUsersAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.data) setUsers(data.data);
    },
  });

  const { execute: assignUser, isExecuting: isAssigning } = useAction(
    assignUserOrganizationAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success("Usuário vinculado com sucesso!");
          setSelectedUserId("");
          setIsOwner(false);
          if (organization) fetchMembers({ organizationId: organization.id });
          window.dispatchEvent(new Event("organization-changed"));
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao vincular usuário");
      },
    },
  );

  const { execute: removeUser } = useAction(removeUserOrganizationAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Usuário removido da empresa");
        if (organization) fetchMembers({ organizationId: organization.id });
        window.dispatchEvent(new Event("organization-changed"));
      }
    },
    onError: () => toast.error("Erro ao remover usuário"),
  });

  useEffect(() => {
    if (open && organization) {
      setIsLoading(true);
      fetchMembers({ organizationId: organization.id });
      fetchUsers({});
    }
  }, [open, organization, fetchMembers, fetchUsers]);

  const availableUsers = users.filter(
    (u) => !members.some((m) => m.userId === u.id),
  );

  const handleAssign = () => {
    if (!organization || !selectedUserId) {
      toast.error("Selecione um usuário");
      return;
    }
    assignUser({
      userId: selectedUserId,
      organizationId: organization.id,
      isOwner,
    });
  };

  const selectClassName = cn(
    "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Usuários da empresa</DialogTitle>
          <DialogDescription>
            {organization?.name
              ? `Gerencie os usuários vinculados a ${organization.name}`
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
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox
                id="isOwner"
                checked={isOwner}
                onCheckedChange={(v) => setIsOwner(v === true)}
              />
              <Label htmlFor="isOwner">Proprietário</Label>
            </div>
            <Button
              onClick={handleAssign}
              disabled={isAssigning || !selectedUserId}
            >
              Vincular
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
                    <TableHead>Proprietário</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-muted-foreground py-6 text-center"
                      >
                        Nenhum usuário vinculado
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
                          {member.isOwner ? "Sim" : "Não"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              organization &&
                              removeUser({
                                userId: member.userId,
                                organizationId: organization.id,
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
