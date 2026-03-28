"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { SubmitEventHandler, useEffect, useState } from "react";
import { query, getDocs, collection, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import PageLoading from "@/components/page-loading";
import { COLLECTIONS } from "@/lib/constants";
import { routes } from "@/lib/routes";

interface Role {
  category: string;
  roles: string[]; //array of string type
}

export default function RolesPage() {
  const [field, setField] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [roleObjects, setRoleObjects] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const fields = roleObjects.map((roleObject) => roleObject.category);

  const selectedRoleObject = getField(field);
  const roles = selectedRoleObject?.roles;

  function getField(category: string) {
    const field = roleObjects.find(
      (roleObject) => roleObject.category == category,
    );
    return field;
  }

  async function getRoles() {
    const rolesSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.roles)),
    );
    const roles = rolesSnapshot.docs.map((doc) => doc.data()) as Role[];
    return roles;
  }

  async function saveRole(field: string, role: string) {
    return setDoc(
      doc(db, COLLECTIONS.users, user.uid),
      { role, field },
      { merge: true },
    );
  }

  useEffect(() => {
    async function handleGetRoles() {
      try {
        setLoadingRoles(true);
        const roles = await getRoles();
        setRoleObjects(roles);
        setLoadingRoles(false);
      } catch (error) {
        toast.error("Failed to fetch roles. Try again");
        setLoadingRoles(false);
      }
    }
    handleGetRoles();
  }, []);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const isValid = validateFormData(field, role);
    if (isValid) {
      try {
        setLoadingSubmit(true);
        await saveRole(field, role);
        setLoadingSubmit(false);
        toast.success("Role saved successfully");
        router.push(routes.dashboard());
      } catch (error) {
        toast.error("Failed to save role. Try again");
        setLoadingSubmit(false);
      }
    } else {
      toast.error("Please select an option for both fields");
    }
  };

  function validateFormData(field: string, role: string): boolean {
    return Boolean(field && role);
  }

  if (loadingRoles) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href={routes.home()} className="inline-flex items-center gap-2">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                IP
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground">
              InterviewPro
            </span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Select your role
            </CardTitle>
            <CardDescription className="text-center">
              Choose the interview role you are preparing for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Select your field</Label>
                <Combobox
                  onValueChange={(value: string) => {
                    setField(value);
                  }}
                  items={fields}
                >
                  <ComboboxInput placeholder="Select a field" />
                  <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Select your role</Label>
                <Combobox
                  onValueChange={(value: string) => {
                    setRole(value);
                  }}
                  items={roles}
                >
                  <ComboboxInput placeholder="Select a role" />
                  <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
