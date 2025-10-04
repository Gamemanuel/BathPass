import {z} from "zod";

export const bathroomPassSchema = z.object({
    id: z.number(),
    name: z.string(),
    destination: z.string().nullable(),
    time_out: z.string(),
    time_in: z.string().nullable(),
    total_time_spent: z.string().nullable(),
})

export type BathroomPass = z.infer<typeof bathroomPassSchema>
