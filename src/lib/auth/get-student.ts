import { prisma } from "@/lib/prisma";
import { getServerAuthContext } from "@/lib/supabase/server";

export async function getAuthedStudent() {
  const auth = await getServerAuthContext();

  if (!auth) {
    return { student: null, user: null };
  }

  const user = auth.user;

  const student =
    (await prisma.student.findUnique({ where: { id: user.id } })) ??
    (await prisma.student.create({
      data: {
        id: user.id,
        email: user.email ?? `unknown-${user.id}@local`,
        name: (user.user_metadata.full_name as string | undefined) ?? null,
      },
    }));

  return { student, user };
}
