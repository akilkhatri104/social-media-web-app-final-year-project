import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { api } from "~/lib/axios";
import type { APIResponse } from "~/lib/types";
import { useNavigate } from "react-router";
import { queryClient, queryKeys } from "~/lib/react-query";
import { safeLocalStorageSetItem, safeSessionStorageClear, STORAGE_KEYS } from "~/lib/storage";

type Props = {
  variant?:
    | "link"
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | null
    | undefined;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
};

const LogoutButton = ({ variant, className }: Props) => {
  const navigate = useNavigate();
  async function logoutHandler() {
    try {
      toast.loading("Logging out....", {
        id: "logout-loading",
      });
      const response = await api.post<APIResponse>("/api/users/logout");
      if (response.status >= 400) {
        toast.error(response.data.message);
      }

      safeSessionStorageClear();
      safeLocalStorageSetItem(STORAGE_KEYS.CROSS_TAB_LOGOUT, String(Date.now()));
      toast.success(response.data.message);
      navigate("/");
      queryClient.setQueryData(queryKeys.auth.me, null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else toast.error("Unknown error has occured");
    } finally {
      toast.dismiss("logout-loading");
    }
  }
  return (
    <Button variant={variant} className={className} onClick={logoutHandler}>
      Logout
    </Button>
  );
};

export default LogoutButton;
