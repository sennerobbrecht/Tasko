# Supabase SQL Run Order

Run these files in order for a fresh setup:

1. `01_tables_and_triggers.sql`
2. `02_rls_and_policies.sql`
3. `03_invite_and_child_functions.sql`
4. `04_mood_functions.sql`
5. `05_routine_and_shop_functions.sql`

## Incremental workflow

- New/changed table/column/index -> edit `01_tables_and_triggers.sql`
- New/changed RLS helper or policy -> edit `02_rls_and_policies.sql`
- Invite/child onboarding function changes -> edit `03_invite_and_child_functions.sql`
- Mood feature function changes -> edit `04_mood_functions.sql`
- Routine/tasks/coins/streak/shop function changes -> edit `05_routine_and_shop_functions.sql`

## Note

`supabase/schema.sql` has been removed. Use this split-file run order as the source of truth.
