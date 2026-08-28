import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function useZodForm<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, "resolver">
): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    ...options,
  });
}

export function createFormSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

export type FormValues<T extends z.ZodType> = z.infer<T>;