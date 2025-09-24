schema "public" {}

table "users" {
  schema = schema.public
  column "id" {
    null = false
    type = uuid
  }
  column "display_id" {
    null = false
    type = varchar(100)
  }
  column "username" {
    null = false 
    type = varchar(100)
  }
  column "email" {
    null = false
    type = varchar(100)
  }
  column "password_hash" {
    null = false
    type = varchar(100)
  }
  column "bio" {
    null = false
    type = text
  }
  column "icon_url" {
    null = false
    type = varchar(255)
  }
  column "created_at" {
    null = false
    type = timestamp
  }
  column "updated_at" {
    null = false
    type = timestamp
  }
  primary_key {
    columns = [column.id]
  }
  unique "displayId" {
    columns = [column.display_id]
  }
  unique "email" {
    columns = [column.email]
  }
}

table "messages" {
  schema = schema.public
  column "id" {
    null = false
    type = uuid
  }
  column "sender_id" {
    null = false
    type = uuid
  }
  column "channel_id" {
    null = false
    type = uuid
  }
  column "content" {
    null = false
    type = text
  }
  column "reply_id" {
    null = true
    type = uuid
  }
  column "created_at" {
    null = false
    type = timestamp
  }
  column "updated_at" {
    null = false
    type = timestamp
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "sender" {
    columns = [column.sender_id]
    ref_columns = [table.users.column.id]
    on_delete = NO_ACTION
  }
  foreign_key "channel" {
    columns = [column.channel_id]
    ref_columns = [table.channels.column.id]
    on_delete = CASCADE
  }
  foreign_key "reply" {
    columns = [column.reply_id]
    ref_columns = [table.messages.column.id]
    on_delete = SET_NULL
  }
}

table "guilds" {
  schema = schema.public
  column "id" {
    null = false
    type = uuid
  }
  column "name" {
    null = false
    type = varchar(100)
  }
  column "owner_id" {
    null = false
    type = uuid
  }
  column "description" {
    null = false
    type = text
  }
  column "icon_url" {
    null = false
    type = varchar(255)
  }
  column "default_channel_id" {
    null = false
    type = uuid
  }
  column "created_at" {
    null = false
    type = timestamp
  }
  column "updated_at" {
    null = false
    type = timestamp
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "owner" {
    columns = [column.owner_id]
    ref_columns = [table.users.column.id]
    on_delete = RESTRICT
  }
}

table "members" {
  schema = schema.public
  column "user_id" {
    null = false
    type = uuid
  }
  column "guild_id" {
    null = false
    type = uuid
  }
  column "nickname" {
    null = false
    type = varchar(100)
  }
  column "joined_at" {
    null = false
    type = timestamp
  }
  column "updated_at" {
    null = false
    type = timestamp
  }
  primary_key {
    columns = [column.user_id, column.guild_id]
  }
  foreign_key "user" {
    columns = [column.user_id]
    ref_columns = [table.users.column.id]
    on_delete = NO_ACTION
  }
  foreign_key "guild" {
    columns = [column.guild_id]
    ref_columns = [table.guilds.column.id]
    on_delete = CASCADE
  }
}

table "categories" {
  schema = schema.public
  column "id" {
    null = false
    type = uuid
  }
  column "guild_id" {
    null = false
    type = uuid
  }
  column "name" {
    null = false
    type = varchar(100)
  }
  column "created_at" {
    null = false
    type = timestamp
  }
  column "updated_at" {
    null = false
    type = timestamp
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "guild" {
    columns = [column.guild_id]
    ref_columns = [table.guilds.column.id]
    on_delete = CASCADE
  }
}

table "channels" {
  schema = schema.public
  column "id" {
    null = false
    type = uuid
  }
  column "name" {
    null = false
    type = varchar(100)
  }
  column "category_id" {
    null = false
    type = uuid
  }
  column "created_at" {
    null = false
    type = timestamp
  }
  column "updated_at" {
    null = false
    type = timestamp
  }
  primary_key {
    columns = [column.id]
  }
  foreign_key "category" {
    columns = [column.category_id]
    ref_columns = [table.categories.column.id]
    on_delete = CASCADE
  }
}

table "invites" {
  schema = schema.public
  column "invite_code" {
    null = false
    type = varchar(16)
  }
  column "creator_id" {
    null = false
    type = uuid
  }
  column "guild_id" {
    null = false
    type = uuid
  }
  column "max_uses" {
    null = false
    type = int
    # 無制限のときは -1
    default = -1
  }
  column "current_uses" {
    null = false
    type = int
    default = 0
  }
  column "expires_at" {
    null = false
    type = timestamp
  }
  column "created_at" {
    null = false
    type = timestamp
  }
  primary_key {
    columns = [column.invite_code]
  }
  foreign_key "creator" {
    columns = [column.creator_id]
    ref_columns = [table.users.column.id]
    on_delete = NO_ACTION
  }
  foreign_key "guild" {
    columns = [column.guild_id]
    ref_columns = [table.guilds.column.id]
    on_delete = CASCADE
  }
}
