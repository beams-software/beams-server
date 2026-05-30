import { z } from "zod";

export const multipleVoterSchema = z.array(
  z.object({
    admid: z.coerce.number(),
    name: z.coerce.string(),
    grade: z.coerce.number(),
    house: z.enum(["WINTER", "SUMMER", "SPRING"]),
    class: z.coerce.string(),
    voted: z.coerce.boolean().default(false),
    votedInfo: z.object({
      createdAt: z.string().default(() => new Date().toISOString()),
      editedAt: z.string().default(() => new Date().toISOString()),
      absent: z.boolean().default(false),
      votingData: z.object({
        votedAt: z.string(),
        votedComputer: z.string(),
        toWho: z.array(z.object({ positionId: z.number(), candidateAdmId: z.number() }))
      }).or(z.object({})).default({})
    })
  })
);

console.log(JSON.stringify(multipleVoterSchema.safeParse(
    [{name: "John", admid: "123", grade: "10", house: "SUMMER", class: "A", votedInfo: {}},
     {name: "Husterson", admid: 123, grade: "11", house: "WINTER", class:"A", votedInfo: {}}
    ])
, null, 4))