"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/context/auth-context";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Briefcase,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useRoles } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { UserProfile } from "@/lib/types";
import ErrorAlert from "@/components/error-alert/ErrorAlert";

const StudentProfileFormSchema = z.object({
  email: z.email("A valid email is required"),
  field: z.string().min(1, "Field is required"),
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  role: z.string().min(1, "Role is required"),
  about: z.string().max(500).default(""),
  // targetCompanies: z.array(z.string()).default([]),  //TODO: Add target companies when needed. Uncomment all target company related code to do so.
});
const resolver = zodResolver(StudentProfileFormSchema);
type StudentProfileFormData = z.infer<typeof StudentProfileFormSchema>;

export default function StudentProfilePage() {
  const { loading: userLoading, userProfile, getUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // const [targetCompanyInput, setTargetCompanyInput] = useState("");
  const { roles: industryRoles, rolesLoading } = useRoles();
  const fields = industryRoles.map((roleObject) => roleObject.category);

  const form = useForm({
    resolver,
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        about: userProfile.about ?? "",
        email: userProfile.email ?? "",
        field: userProfile.field ?? "",
        firstname: userProfile.firstname ?? "",
        lastname: userProfile.lastname ?? "",
        role: userProfile.role ?? "",
        // targetCompanies: userProfile.targetCompanies ?? [],
      });
    }
  }, [userProfile]);

  const about = form.watch("about");
  const field = form.watch("field");
  // const targetCompanies = form.watch("targetCompanies");

  function getField(category: string) {
    const field = industryRoles.find(
      (roleObject) => roleObject.category == category,
    );
    return field;
  }

  // const targetCompanyHandleAdd = () => {
  //   if (
  //     targetCompanyInput.trim() &&
  //     targetCompanyInput.length > 0 &&
  //     targetCompanyInput.length < 100
  //   ) {
  //     const currentCompanies = form.getValues("targetCompanies");
  //     form.setValue("targetCompanies", [
  //       ...currentCompanies,
  //       targetCompanyInput,
  //     ]);
  //     setTargetCompanyInput("");
  //   } else {
  //     toast.error("Target company should be less than 100 characters");
  //   }
  // };

  // const targetCompanyHandleRemove = (index: number) => {
  //   const currentCompanies = form.getValues("targetCompanies");
  //   form.setValue(
  //     "targetCompanies",
  //     currentCompanies.filter((_, i) => i !== index),
  //   );
  // };

  const selectedRoleObject = getField(field);
  const roles = selectedRoleObject?.roles;

  const onSubmit: SubmitHandler<StudentProfileFormData> = async (data) => {
    try {
      setError(null);
      setSaving(true);
      setSuccess(false);

      await setDoc(
        doc(db, COLLECTIONS.users, userProfile.id),
        {
          ...data,
          updatedAt: serverTimestamp() as Timestamp,
        } satisfies Partial<UserProfile>,
        { merge: true },
      );
      setSuccess(true);
      toast.success("Profile updated successfully!");
      await getUserProfile();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      console.error(err);
      toast.error(`Failed to update profile: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || rolesLoading) {
    return (
      <div className="space-y-6 mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-4">
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Edit Profile
          </h1>
          <p className="text-muted-foreground">
            Update your personal information and interview preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Manage your public profile details
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Display Name */}
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>First name *</FormLabel>
                      <FormControl>
                        <Input
                          name="firstname"
                          type="text"
                          placeholder="Enter first name"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-10"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Last name *</FormLabel>
                      <FormControl>
                        <Input
                          name="lastname"
                          type="text"
                          placeholder="Enter last name"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-10"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Enter email"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-10 bg-muted text-muted-foreground"
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>About You (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          name="about"
                          placeholder="Tell us about yourself, your background, and career goals..."
                          value={field.value}
                          onChange={field.onChange}
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        {about?.length}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interview Preferences */}
                <div className="border-t border-border pt-6 space-y-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="size-5 text-primary" />
                    Interview Preferences
                  </h3>

                  {/* Target Field */}
                  <FormField
                    control={form.control}
                    name="field"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Field *</FormLabel>
                        <FormControl>
                          <Combobox
                            key={field.value}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              form.resetField("role", { defaultValue: "" });
                            }}
                            value={field.value}
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
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          The field you&apos;re preparing to interview for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Role */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Role *</FormLabel>
                        <FormControl>
                          <Combobox
                            key={field.value}
                            onValueChange={(value: string) =>
                              field.onChange(value)
                            }
                            value={field.value}
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
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          The role you&apos;re preparing to interview for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Companies */}
                  {/* <FormField
                    control={form.control}
                    name="targetCompanies"
                    render={(field) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Target Companies (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., Google, Microsoft, Apple"
                              value={targetCompanyInput}
                              onChange={(e) =>
                                setTargetCompanyInput(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  targetCompanyHandleAdd();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={targetCompanyHandleAdd}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        {targetCompanies?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {targetCompanies.map((company, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="pl-2"
                              >
                                {company}
                                <button
                                  type="button"
                                  onClick={() => targetCompanyHandleRemove(idx)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        <FormDescription className="text-xs text-muted-foreground">
                          Companies you&apos;re targeting
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>

                {/* Alerts */}
                {error && <ErrorAlert errorMessage={error} />}

                {success && (
                  <Alert className="bg-success/10 border-success/20 text-success">
                    <CheckCircle2 className="size-4" />
                    <AlertDescription className="text-success">
                      Profile updated successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-10"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
