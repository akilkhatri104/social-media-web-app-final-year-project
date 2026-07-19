import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { api } from "~/lib/axios";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { Trash2Icon, AlertTriangleIcon } from "lucide-react";
import axios from "axios";
import { useDocumentTitle } from "~/lib/title";
import { queryClient, queryKeys } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";

export default function AccountSettings() {
  useDocumentTitle("Account · Settings");

  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await api.delete<APIResponse>("/api/settings/account", {
        data: { password },
      });
    },
    onSuccess: () => {
      toast.success("Your account has been deleted.");
      queryClient.clear();
      navigate("/signin", { replace: true });
    },
    onError: (error) => {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Failed to delete account"
          : "Failed to delete account"
      );
    },
  });

  const handleDelete = () => {
    if (!password) {
      toast.error("Please enter your password to confirm.");
      return;
    }
    if (confirmText !== "DELETE") {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    deleteAccountMutation.mutate();
  };

  return (
    <div className="max-w-2xl space-y-8 p-6 md:p-10">
      <h1 className="text-2xl font-bold">Account</h1>

      {/* Danger Zone */}
      <Card className="border border-destructive/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shrink-0">
                  <Trash2Icon className="mr-2 h-3.5 w-3.5" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangleIcon className="h-5 w-5 text-destructive" />
                    Delete your account?
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently delete your account, posts, and all
                    associated data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-muted-foreground">
                      Confirm your password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-muted-foreground">
                      Type <strong>DELETE</strong> to confirm
                    </label>
                    <Input
                      placeholder="DELETE"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" disabled={deleteAccountMutation.isPending}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={
                      deleteAccountMutation.isPending ||
                      confirmText !== "DELETE" ||
                      !password
                    }
                  >
                    {deleteAccountMutation.isPending
                      ? "Deleting…"
                      : "Delete my account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
