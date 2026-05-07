export type Id<T extends string> = string & { __tableName: T };
export type Doc<T extends string> = any;
