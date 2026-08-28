import { z } from "zod";
import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function createFormSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema;
}

export type FormSchema<T extends z.ZodTypeAny> = z.infer<T>;

export function useZodForm<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  options?: Omit<UseFormProps<T>, "resolver">
): UseFormReturn<T> {
  return useForm<T>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    ...options,
  });
}

export function getFormErrorMessage(error: z.ZodError, path: string): string | undefined {
  const issue = error.issues.find((i) => i.path.join(".") === path);
  return issue?.message;
}

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const flattened: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!flattened[path]) {
      flattened[path] = issue.message;
    }
  }
  return flattened;
}

export const commonSchemas = {
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  requiredString: (fieldName: string) => z.string().min(1, `${fieldName} es requerido`),
  positiveNumber: (fieldName: string) => z.coerce.number().positive(`${fieldName} debe ser positivo`),
  optionalString: z.string().optional(),
  url: z.string().url("URL inválida"),
};