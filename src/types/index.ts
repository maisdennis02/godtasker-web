// Shapes mirror the Sequelize models in godTaskerServer1-2/src/app/models.
// Most fields are nullable in practice, so optional + loose typing is intentional.

export interface FileRef {
  id?: number
  name?: string
  path?: string
  url?: string
}

export interface User {
  id: number
  subscriber?: boolean
  first_name?: string | null
  last_name?: string | null
  user_name?: string
  email: string
  hint?: string | null
  phonenumber?: string | null
  birth_date?: string | null
  gender?: string | null
  bio?: string | null
  instagram?: string | null
  linkedin?: string | null
  occupation?: string | null
  points?: number | null
  avatar?: FileRef | null
}

export interface Task {
  id: number
  name?: string
  description?: string
  status?: unknown
  status_bar?: number
  points?: number
  price?: number
  requester_email?: string
  assignee_email?: string
  start_date?: string | null
  due_date?: string | null
  end_date?: string | null
  initiated_at?: string | null
  canceled_at?: string | null
  requester?: User
  assignee?: User
}

export interface Offering {
  id: number
  creator_id?: number
  name?: string
  description?: string
  price?: number
  confirm_photo_option?: number
  tenure?: number
  display_in_profile?: boolean
  creator?: User
}

export interface Conversation {
  id: number
  chat_id: number
  user_email: string
  worker_email: string
  messaged_at?: string
  user?: User
  peer?: User
}

export interface ChatMessage {
  id: number
  chat_id: number
  sender_email: string
  recipient_email?: string | null
  body: string
  read_at?: string | null
  createdAt?: string
  created_at?: string
}

export interface AuthUser {
  id: number
  email: string
  user_name?: string
  avatar?: FileRef | null
}

export interface SessionResponse {
  user: AuthUser
  token: string
}
