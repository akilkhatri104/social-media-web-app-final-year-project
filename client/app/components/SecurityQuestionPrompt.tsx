import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "~/lib/axios";
import type { APIResponse } from "~/lib/types";
import { safeSessionStorageGetItem, safeSessionStorageSetItem, STORAGE_KEYS } from "~/lib/storage";
import { useMe } from "~/hooks/useMe";
import { Button } from "./ui/button";

export default function SecurityQuestionPrompt() {
    const { isAuth, isInitialLoading, data: user } = useMe();
    const location = useLocation();
    const navigate = useNavigate();
    const [dismissed, setDismissed] = useState(
        safeSessionStorageGetItem(STORAGE_KEYS.SECURITY_QUESTION_DISMISSED) === "true"
    );

    const { data: securityQuestionData } = useQuery({
        queryKey: ["security-question"],
        enabled: !isInitialLoading && isAuth && !!user?.emailVerified,
        queryFn: async () => {
            const res = await api.get<APIResponse>("/api/users/security-question");

            return res.data.data as {
                configured: boolean;
                question: string | null;
            };
        },
    });

    const handleDismiss = () => {
        setDismissed(true);
        safeSessionStorageSetItem(STORAGE_KEYS.SECURITY_QUESTION_DISMISSED, "true");
    };

    if (isInitialLoading) {
        return null;
    }

    if (
        dismissed ||
        !isAuth ||
        !user?.emailVerified ||
        securityQuestionData?.configured !== false ||
        location.pathname === "/settings/security"
    ) {
        return null;
    }

    return (
        <div className="flex justify-between items-center p-2 bg-accent text-accent-foreground">
            <p>Add a security question to protect high-risk sign-ins.</p>
            <span className="flex items-center">
                <Button variant="ghost" onClick={handleDismiss}><X /></Button>
                <Button onClick={() => navigate("/settings/security#security-question")}>Set Up Security Question</Button>
            </span>
        </div>
    );
}
