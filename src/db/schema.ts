import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const organizationsTable = pgTable("organizations", {
  id: text("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  tradeName: varchar("trade_name", { length: 255 }),

  cnpj: varchar("cnpj", { length: 18 }).unique(),

  email: varchar("email", { length: 255 }),

  phone: varchar("phone", { length: 20 }),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  language: varchar("language", { length: 10 }).default("pt-BR").notNull(),

  currency: varchar("currency", { length: 10 }).default("BRL").notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").notNull(),

  updatedAt: timestamp("updated_at").notNull(),
});

export const userOrganizationsTable = pgTable(
  "user_organizations",
  {
    userId: text("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),

    organizationId: text("organization_id")
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    isOwner: boolean("is_owner").default(false).notNull(),

    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.organizationId],
    }),
  }),
);

export const rolesTable = pgTable("roles", {
  id: text("id").primaryKey(),

  organizationId: text("organization_id")
    .references(() => organizationsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),

  name: varchar("name", { length: 80 }).notNull(),

  description: text("description"),

  createdAt: timestamp("created_at").notNull(),

  updatedAt: timestamp("updated_at").notNull(),
});

export const userRolesTable = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),

    roleId: text("role_id")
      .references(() => rolesTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.roleId],
    }),
  }),
);

export const companyStatusEnum = pgEnum("company_status", [
  "LEAD",
  "PROSPECT",
  "CUSTOMER",
  "PARTNER",
  "SUPPLIER",
  "INACTIVE",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "MANUAL",
  "SITE",
  "WHATSAPP",
  "FACEBOOK",
  "INSTAGRAM",
  "GOOGLE",
  "INDICATION",
  "API",
  "IMPORT",
]);

export const companiesTable = pgTable(
  "companies",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 255 }).notNull(),

    tradeName: varchar("trade_name", { length: 255 }),

    cnpj: varchar("cnpj", { length: 18 }),

    ie: varchar("ie", { length: 20 }),

    email: varchar("email", { length: 255 }),

    source: leadSourceEnum("source").default("MANUAL").notNull(),

    phone: varchar("phone", { length: 20 }),

    city: varchar("city", { length: 120 }),

    mobile: varchar("mobile", { length: 20 }),

    status: companyStatusEnum("status").default("LEAD").notNull(),

    website: varchar("website", { length: 255 }),

    industry: varchar("industry", { length: 120 }),

    employees: integer("employees"),

    annualRevenue: numeric("annual_revenue", {
      precision: 15,
      scale: 2,
    }),

    notes: text("notes"),

    isActive: boolean("is_active").default(true).notNull(),

    ownerId: text("owner_id").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),
    createdBy: text("created_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    organizationIdx: index("companies_org_idx").on(table.organizationId),

    nameIdx: index("companies_name_idx").on(table.name),

    cnpjIdx: uniqueIndex("companies_cnpj_idx").on(
      table.organizationId,
      table.cnpj,
    ),
  }),
);

export const contactsTable = pgTable(
  "contacts",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      }),

    companyId: text("company_id")
      .notNull()
      .references(() => companiesTable.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 255 }).notNull(),

    avatar: text("avatar"),

    jobTitle: varchar("job_title", { length: 150 }),

    department: varchar("department", {
      length: 150,
    }),

    email: varchar("email", { length: 255 }),

    phone: varchar("phone", { length: 20 }),

    mobile: varchar("mobile", { length: 20 }),

    allowMarketing: boolean("allow_marketing").default(true).notNull(),

    allowWhatsapp: boolean("allow_whatsapp").default(true).notNull(),
    whatsapp: varchar("whatsapp", {
      length: 20,
    }),

    birthday: timestamp("birthday"),

    linkedin: varchar("linkedin", {
      length: 255,
    }),

    isPrimary: boolean("is_primary").default(false).notNull(),

    ownerId: text("owner_id").references(() => usersTable.id),

    notes: text("notes"),

    isActive: boolean("is_active").default(true).notNull(),

    createdBy: text("created_by").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    organizationIdx: index("contacts_org_idx").on(table.organizationId),

    companyIdx: index("contacts_company_idx").on(table.companyId),

    emailIdx: index("contacts_email_idx").on(table.email),
  }),
);

export const unitMeasureEnum = pgEnum("unit_measure", [
  "UN",
  "CX",
  "PC",
  "KG",
  "G",
  "L",
  "ML",
  "M",
  "CM",
  "MM",
  "M2",
  "M3",
  "KIT",
  "PAR",
  "OUTRO",
]);

export const productFamiliesTable = pgTable(
  "product_families",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 150 }).notNull(),

    description: text("description"),

    isActive: boolean("is_active").default(true).notNull(),

    ownerId: text("owner_id").references(() => usersTable.id),

    createdBy: text("created_by").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    organizationIdx: index("product_family_org_idx").on(table.organizationId),

    nameIdx: uniqueIndex("product_family_name_idx").on(
      table.organizationId,
      table.name,
    ),
  }),
);

export const productGroupsTable = pgTable(
  "product_groups",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      }),

    familyId: text("family_id")
      .notNull()
      .references(() => productFamiliesTable.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 150 }).notNull(),

    description: text("description"),

    isActive: boolean("is_active").default(true).notNull(),

    ownerId: text("owner_id").references(() => usersTable.id),

    createdBy: text("created_by").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    organizationIdx: index("product_group_org_idx").on(table.organizationId),

    familyIdx: index("product_group_family_idx").on(table.familyId),

    nameIdx: uniqueIndex("product_group_name_idx").on(
      table.organizationId,
      table.familyId,
      table.name,
    ),
  }),
);

export const productTypeEnum = pgEnum("product_type", ["PRODUCT", "SERVICE"]);

export const productsTable = pgTable(
  "products",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      }),

    groupId: text("group_id")
      .notNull()
      .references(() => productGroupsTable.id, {
        onDelete: "cascade",
      }),

    code: varchar("code", { length: 50 }).notNull(),

    name: varchar("name", { length: 255 }).notNull(),

    description: text("description"),

    unit: unitMeasureEnum("unit").notNull(),

    type: productTypeEnum("type").default("PRODUCT").notNull(),

    unitPrice: numeric("unit_price", {
      precision: 15,
      scale: 2,
    }).default("0"),

    isActive: boolean("is_active").default(true).notNull(),

    ownerId: text("owner_id").references(() => usersTable.id),

    createdBy: text("created_by").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    organizationIdx: index("products_org_idx").on(table.organizationId),

    groupIdx: index("products_group_idx").on(table.groupId),

    codeIdx: uniqueIndex("products_code_idx").on(
      table.organizationId,
      table.code,
    ),

    nameIdx: index("products_name_idx").on(table.name),
  }),
);

export const salesPipelinesTable = pgTable(
  "sales_pipelines",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 150 }).notNull(),

    description: text("description"),

    color: varchar("color", { length: 20 }).default("#3B82F6"),

    isDefault: boolean("is_default").default(false).notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    ownerId: text("owner_id").references(() => usersTable.id),

    createdBy: text("created_by").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    organizationIdx: index("sales_pipeline_org_idx").on(table.organizationId),

    nameIdx: uniqueIndex("sales_pipeline_name_idx").on(
      table.organizationId,
      table.name,
    ),
  }),
);

export const salesPipelineStagesTable = pgTable(
  "sales_pipeline_stages",
  {
    id: text("id").primaryKey(),

    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => salesPipelinesTable.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 150 }).notNull(),

    description: text("description"),

    color: varchar("color", { length: 20 }).default("#94A3B8"),

    sortOrder: integer("sort_order").notNull(),

    probability: integer("probability").default(0).notNull(),

    isWon: boolean("is_won").default(false).notNull(),

    isLost: boolean("is_lost").default(false).notNull(),

    isEditable: boolean("is_editable").default(true).notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    ownerId: text("owner_id").references(() => usersTable.id),

    createdBy: text("created_by").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    pipelineIdx: index("sales_pipeline_stage_pipeline_idx").on(
      table.pipelineId,
    ),

    orderIdx: index("sales_pipeline_stage_order_idx").on(
      table.pipelineId,
      table.sortOrder,
    ),
  }),
);

export const salesDealStatusEnum = pgEnum("sales_deal_status", [
  "OPEN",
  "WON",
  "LOST",
  "CANCELED",
]);

export const salesDealsTable = pgTable(
  "sales_deals",
  {
    id: text("id").primaryKey(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, {
        onDelete: "cascade",
      }),

    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => salesPipelinesTable.id),

    stageId: text("stage_id")
      .notNull()
      .references(() => salesPipelineStagesTable.id),

    companyId: text("company_id").references(() => companiesTable.id),

    contactId: text("contact_id").references(() => contactsTable.id),

    ownerId: text("owner_id").references(() => usersTable.id),

    title: varchar("title", { length: 255 }).notNull(),

    description: text("description"),

    value: numeric("value", {
      precision: 15,
      scale: 2,
    }),

    probability: integer("probability"),

    expectedCloseDate: timestamp("expected_close_date"),

    startDate: timestamp("start_date"),

    status: salesDealStatusEnum("status").default("OPEN").notNull(),

    source: leadSourceEnum("source"),

    tags: text("tags"),

    lostReason: text("lost_reason"),

    wonAt: timestamp("won_at"),

    lostAt: timestamp("lost_at"),

    closedAt: timestamp("closed_at"),

    isActive: boolean("is_active").default(true).notNull(),

    createdBy: text("created_by").references(() => usersTable.id),

    updatedBy: text("updated_by").references(() => usersTable.id),

    createdAt: timestamp("created_at").notNull(),

    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    organizationIdx: index("sales_deals_org_idx").on(table.organizationId),

    pipelineIdx: index("sales_deals_pipeline_idx").on(table.pipelineId),

    stageIdx: index("sales_deals_stage_idx").on(table.stageId),

    companyIdx: index("sales_deals_company_idx").on(table.companyId),

    ownerIdx: index("sales_deals_owner_idx").on(table.ownerId),
  }),
);

export const salesDealCollaboratorsTable = pgTable(
  "sales_deal_collaborators",
  {
    dealId: text("deal_id")
      .notNull()
      .references(() => salesDealsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.dealId, table.userId] }),
  }),
);

export const salesDealProductsTable = pgTable(
  "sales_deal_products",
  {
    dealId: text("deal_id")
      .notNull()
      .references(() => salesDealsTable.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => productsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.dealId, table.productId] }),
  }),
);