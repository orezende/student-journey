export interface ColumnDef {
  type?: string;
  primary?: boolean;
  generated?: 'uuid' | 'increment';
  unique?: boolean;
  name?: string;
  createDate?: boolean;
  nullable?: boolean;
}
