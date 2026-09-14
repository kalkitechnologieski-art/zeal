import { createAdminClient as getDatabaseAdmin } from '@zeal/database';

export function createAdminClient() {
  return getDatabaseAdmin();
}
