# Prisma → Supabase Migration Report

Generated: 2026-09-14T12:12:53Z

## Files that import Prisma

| File | Prisma usage | Supabase replacement |
|------|--------------|---------------------|

**Total files: 0**

## Cheat-sheet

| Prisma | Supabase |
|--------|----------|
| `prisma.user.findUnique({ where: { id } })` | `supabaseAdmin.from('User').select('*').eq('id', id).maybeSingle()` |
| `prisma.user.findMany({ where, take })` | `supabaseAdmin.from('User').select('*').eq(...).limit(n)` |
| `prisma.user.create({ data })` | `supabaseAdmin.from('User').insert(data).select().single()` |
| `prisma.user.update({ where, data })` | `supabaseAdmin.from('User').update(data).eq('id', id).select().single()` |
| `prisma.user.delete({ where })` | `supabaseAdmin.from('User').delete().eq('id', id)` |
| `prisma.user.count({ where })` | `supabaseAdmin.from('User').select('*', { count: 'exact', head: true })` |
| `include: { posts: true }` | `.select('*, posts:Post(*)')` |
| `_count: { select: { posts: true } }` | `.select('*, posts:Post(count)')` |
