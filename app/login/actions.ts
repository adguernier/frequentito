"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import z from "zod";

const LoginFormSchema = z.object({
  email: z.email({ message: "Please enter a valid email." }).trim(),
  password: z.string().trim(),
});

type FormState =
  | {
      errors: string;
    }
  | {
      errors: {
        errors: string[];
        properties?: {
          email?: { errors: string[] };
          password?: { errors: string[] };
        };
      };
    }
  | undefined;

type LoginFormData = {
  email: string;
  password: string;
};

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const data: LoginFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validatedFields = LoginFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: z.treeifyError(validatedFields.error),
    };
  }

  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    return {
      errors: error.message,
    };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
