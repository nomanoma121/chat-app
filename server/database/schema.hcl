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
    null = true
    type = text
  }
  column "icon_url" {
    null = true
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
}
