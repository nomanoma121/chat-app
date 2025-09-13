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
  column "author_id" {
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
  foreign_key "author" {
    columns = [column.author_id]
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
    null = true
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
  column "position" {
    null = false
    type = int
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
    type = uuid
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
    default = 0
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

# Table users {
#   id uuid [primary key]
#   display_id varchar [unique]
#   username varchar
#   email varchar
#   password_hash varchar
#   bio varchar [null]
#   icon_url varchar
#   created_at timestamp
#   updated_at timestamp
# }

# Table messages {
#   id uuid [primary key]
#   author_id uuid [ref: > users.id]
#   channel_id uuid [ref: > channels.id]
#   content text
#   reply_id uuid [ref: > messages.id, null]
#   created_at timestamp
#   updated_at timestamp
# }

# Table servers {
#   id uuid [primary key]
#   name varchar
#   owner_id uuid [ref: > users.id]
#   discription text
#   icon_url varchar
#   created_at timestamp
#   updated_at timestamp
# }

# Table members {
#   user_id uuid [ref: > users.id]
#   server_id uuid [ref: > servers.id]
#   nickname varchar [null]
#   joined_at timestamp
#   updated_at timestamp
#   indexes {
#     (user_id, server_id) [pk]
#   }
# }

# Table categories {
#   id uuid [primary key]
#   server_id uuid [ref: > servers.id]
#   position int
#   name varchar
#   created_at timestamp
#   updated_at timestamp
# }

# Table invites {
#   id uuid [primary key]
#   creator_id uuid [ref: > users.id]
#   server_id uuid [ref: > servers.id]
#   max_uses int [default: 0]
#   current_uses int [default: 0]
#   expires_at timestamp
#   created_at timestamp
# }

# Table channels {
#   id uuid [primary key]
#   name varchar
#   category_id uuid [ref: > categories.id]
#   created_at timestamp
#   updated_at timestamp
# }
