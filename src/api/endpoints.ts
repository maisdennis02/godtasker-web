// Descriptor catalog of every GodTasker REST endpoint (from server src/routes.js).
// The ApiConsole renders one EndpointCard per spec, guaranteeing full coverage.
// `default` supports the tokens {email} and {id} (filled from the logged-in user).

export type FieldIn = 'path' | 'query' | 'body'

export interface FieldSpec {
  name: string
  in: FieldIn
  type?: 'text' | 'number' | 'textarea' | 'datetime'
  placeholder?: string
  default?: string
}

export interface EndpointSpec {
  group: string
  label: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  fields?: FieldSpec[]
}

export const ENDPOINTS: EndpointSpec[] = [
  // ── Auth ────────────────────────────────────────────────
  {
    group: 'Auth',
    label: 'Register user',
    method: 'POST',
    path: '/users',
    fields: [
      { name: 'user_name', in: 'body', placeholder: 'jane' },
      { name: 'email', in: 'body', placeholder: 'jane@test.com' },
      { name: 'password', in: 'body', placeholder: 'min 8 chars' },
    ],
  },
  {
    group: 'Auth',
    label: 'Login (returns token)',
    method: 'POST',
    path: '/sessions',
    fields: [
      { name: 'email', in: 'body', default: '{email}' },
      { name: 'password', in: 'body', placeholder: 'password123' },
    ],
  },

  // ── Dashboard ───────────────────────────────────────────
  {
    group: 'Dashboard',
    label: 'Aggregated dashboard counts',
    method: 'GET',
    path: '/dashboard/:id',
    fields: [
      { name: 'id', in: 'path', default: '{id}' },
      { name: 'user_id', in: 'query', type: 'number', default: '{id}' },
      { name: 'worker_id', in: 'query', type: 'number', default: '{id}' },
    ],
  },

  // ── Files ───────────────────────────────────────────────
  { group: 'Files', label: 'List files', method: 'GET', path: '/files' },

  // ── Tasks ───────────────────────────────────────────────
  {
    group: 'Tasks',
    label: 'List tasks I sent (token-scoped)',
    method: 'GET',
    path: '/tasks',
    fields: [{ name: 'assigneeNameFilter', in: 'query' }],
  },
  {
    group: 'Tasks',
    label: 'Send a task',
    method: 'POST',
    path: '/tasks',
    fields: [
      { name: 'assignee_email', in: 'body', placeholder: 'bob@test.com' },
      { name: 'name', in: 'body' },
      { name: 'description', in: 'body', type: 'textarea' },
      { name: 'start_date', in: 'body', type: 'datetime' },
      { name: 'due_date', in: 'body', type: 'datetime' },
      { name: 'points', in: 'body', type: 'number' },
    ],
  },
  {
    group: 'Tasks',
    label: 'Received: finished',
    method: 'GET',
    path: '/tasks/finished',
    fields: [
      { name: 'assigneeID', in: 'query', type: 'number', default: '{id}' },
      { name: 'nameFilter', in: 'query' },
    ],
  },
  {
    group: 'Tasks',
    label: 'Received: unfinished',
    method: 'GET',
    path: '/tasks/unfinished',
    fields: [
      { name: 'assigneeID', in: 'query', type: 'number', default: '{id}' },
      { name: 'nameFilter', in: 'query' },
    ],
  },
  {
    group: 'Tasks',
    label: 'Received: canceled',
    method: 'GET',
    path: '/tasks/canceled',
    fields: [{ name: 'assigneeID', in: 'query', type: 'number', default: '{id}' }],
  },
  {
    group: 'Tasks',
    label: 'Received: counts',
    method: 'GET',
    path: '/tasks/count',
    fields: [{ name: 'assigneeID', in: 'query', type: 'number', default: '{id}' }],
  },
  {
    group: 'Tasks',
    label: 'Task details',
    method: 'GET',
    path: '/tasks/:id/details',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
  {
    group: 'Tasks',
    label: 'Sent: canceled',
    method: 'GET',
    path: '/tasks/user/canceled',
    fields: [{ name: 'requesterID', in: 'query', type: 'number', default: '{id}' }],
  },
  {
    group: 'Tasks',
    label: 'Sent: unfinished',
    method: 'GET',
    path: '/tasks/user/unfinished',
    fields: [
      { name: 'requesterID', in: 'query', type: 'number', default: '{id}' },
      { name: 'nameFilter', in: 'query' },
      { name: 'assigneeNameFilter', in: 'query' },
    ],
  },
  {
    group: 'Tasks',
    label: 'Sent: finished',
    method: 'GET',
    path: '/tasks/user/finished',
    fields: [
      { name: 'requesterID', in: 'query', type: 'number', default: '{id}' },
      { name: 'nameFilter', in: 'query' },
      { name: 'assigneeNameFilter', in: 'query' },
    ],
  },
  {
    group: 'Tasks',
    label: 'Sent: counts',
    method: 'GET',
    path: '/tasks/user/count',
    fields: [{ name: 'requesterID', in: 'query', type: 'number', default: '{id}' }],
  },
  {
    group: 'Tasks',
    label: 'Confirm task',
    method: 'PUT',
    path: '/tasks/confirm/:id',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
  {
    group: 'Tasks',
    label: 'Update task',
    method: 'PUT',
    path: '/tasks/:id',
    fields: [
      { name: 'id', in: 'path', type: 'number' },
      { name: 'name', in: 'body' },
      { name: 'description', in: 'body', type: 'textarea' },
    ],
  },
  {
    group: 'Tasks',
    label: 'Notify assignee',
    method: 'PUT',
    path: '/tasks/:id/notification/worker',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
  {
    group: 'Tasks',
    label: 'Notify assignee (subtask)',
    method: 'PUT',
    path: '/tasks/:id/notification/worker/subtask',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
  {
    group: 'Tasks',
    label: 'Cancel task',
    method: 'PUT',
    path: '/tasks/:id/cancel',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
  {
    group: 'Tasks',
    label: 'Revive task',
    method: 'PUT',
    path: '/tasks/:id/revive',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
  {
    group: 'Tasks',
    label: 'Update task status',
    method: 'PUT',
    path: '/tasks/:id/status',
    fields: [
      { name: 'id', in: 'path', type: 'number' },
      { name: 'status', in: 'body', placeholder: 'in_progress' },
    ],
  },
  {
    group: 'Tasks',
    label: 'Delete task',
    method: 'DELETE',
    path: '/tasks/:id',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },

  // ── Offerings ───────────────────────────────────────────
  {
    group: 'Offerings',
    label: "List a user's offerings",
    method: 'GET',
    path: '/offerings',
    fields: [{ name: 'creator_id', in: 'query', type: 'number', default: '{id}' }],
  },
  {
    group: 'Offerings',
    label: 'Create offering',
    method: 'POST',
    path: '/offerings',
    fields: [
      { name: 'name', in: 'body' },
      { name: 'description', in: 'body', type: 'textarea' },
      { name: 'price', in: 'body', type: 'number' },
      { name: 'tenure', in: 'body', type: 'number' },
      { name: 'display_in_profile', in: 'body', placeholder: 'true' },
    ],
  },
  {
    group: 'Offerings',
    label: 'Request offering (spawns a task)',
    method: 'POST',
    path: '/offerings/:id/request',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
  {
    group: 'Offerings',
    label: 'Update offering',
    method: 'PUT',
    path: '/offerings/:id',
    fields: [
      { name: 'id', in: 'path', type: 'number' },
      { name: 'name', in: 'body' },
    ],
  },
  {
    group: 'Offerings',
    label: 'Delete offering',
    method: 'DELETE',
    path: '/offerings/:id',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },

  // ── Users ───────────────────────────────────────────────
  { group: 'Users', label: 'List users', method: 'GET', path: '/users' },
  {
    group: 'Users',
    label: 'Get user by id',
    method: 'GET',
    path: '/users/:id',
    fields: [{ name: 'id', in: 'path', type: 'number', default: '{id}' }],
  },
  { group: 'Users', label: 'Blocked list', method: 'GET', path: '/users/block' },
  { group: 'Users', label: 'Flagged list', method: 'GET', path: '/users/flag' },
  {
    group: 'Users',
    label: 'Following list',
    method: 'GET',
    path: '/users/following',
    fields: [
      { name: 'contactName', in: 'query' },
      { name: 'nameFilter', in: 'query' },
    ],
  },
  {
    group: 'Users',
    label: 'Following count',
    method: 'GET',
    path: '/users/following/count',
    fields: [{ name: 'contactName', in: 'query' }],
  },
  {
    group: 'Users',
    label: 'Following individual',
    method: 'GET',
    path: '/users/following/individual',
    fields: [
      { name: 'user_id', in: 'query', type: 'number', default: '{id}' },
      { name: 'target_id', in: 'query', type: 'number' },
    ],
  },
  {
    group: 'Users',
    label: 'Followers list',
    method: 'GET',
    path: '/users/followers',
    fields: [
      { name: 'userName', in: 'query' },
      { name: 'nameFilter', in: 'query' },
    ],
  },
  {
    group: 'Users',
    label: 'Followers count',
    method: 'GET',
    path: '/users/followers/count',
    fields: [{ name: 'userName', in: 'query' }],
  },
  {
    group: 'Users',
    label: 'Follow a user',
    method: 'POST',
    path: '/users/following',
    fields: [
      { name: 'user_email', in: 'body', default: '{email}' },
      { name: 'target_email', in: 'body' },
    ],
  },
  {
    group: 'Users',
    label: 'Update profile',
    method: 'PUT',
    path: '/users',
    fields: [
      { name: 'first_name', in: 'body' },
      { name: 'last_name', in: 'body' },
      { name: 'bio', in: 'body', type: 'textarea' },
    ],
  },
  {
    group: 'Users',
    label: 'Update profile (no photo)',
    method: 'PUT',
    path: '/users/no-photo',
    fields: [{ name: 'first_name', in: 'body' }],
  },
  {
    group: 'Users',
    label: 'Block user',
    method: 'PUT',
    path: '/users/block',
    fields: [
      { name: 'email', in: 'body', default: '{email}' },
      { name: 'blocker_email', in: 'body' },
    ],
  },
  {
    group: 'Users',
    label: 'Unblock user',
    method: 'PUT',
    path: '/users/unblock',
    fields: [
      { name: 'email', in: 'body', default: '{email}' },
      { name: 'unblocker_email', in: 'body' },
    ],
  },
  {
    group: 'Users',
    label: 'Flag user',
    method: 'PUT',
    path: '/users/flag',
    fields: [
      { name: 'email', in: 'body' },
      { name: 'flagger_email', in: 'body', default: '{email}' },
    ],
  },
  {
    group: 'Users',
    label: 'Unfollow a user',
    method: 'PUT',
    path: '/users/following',
    fields: [
      { name: 'user_email', in: 'body', default: '{email}' },
      { name: 'target_email', in: 'body' },
    ],
  },
  {
    group: 'Users',
    label: 'Update notifications',
    method: 'PUT',
    path: '/users/notifications/:id',
    fields: [
      { name: 'id', in: 'path', type: 'number', default: '{id}' },
      { name: 'notification_token', in: 'body' },
    ],
  },
  {
    group: 'Users',
    label: 'Update points',
    method: 'PUT',
    path: '/users/points/:id',
    fields: [
      { name: 'id', in: 'path', type: 'number', default: '{id}' },
      { name: 'points', in: 'body', type: 'number' },
    ],
  },
  {
    group: 'Users',
    label: 'Delete user',
    method: 'DELETE',
    path: '/users/:id',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },

  // ── Signatures ──────────────────────────────────────────
  { group: 'Signatures', label: 'List signatures', method: 'GET', path: '/signatures' },

  // ── Messages (conversation headers) ─────────────────────
  {
    group: 'Messages',
    label: 'List my conversations',
    method: 'GET',
    path: '/messages',
    fields: [{ name: 'user_email', in: 'query', default: '{email}' }],
  },
  {
    group: 'Messages',
    label: 'Find conversation (my side)',
    method: 'GET',
    path: '/messages/user',
    fields: [
      { name: 'user_email', in: 'query', default: '{email}' },
      { name: 'worker_email', in: 'query', placeholder: 'peer email' },
    ],
  },
  {
    group: 'Messages',
    label: 'Find conversation (peer side)',
    method: 'GET',
    path: '/messages/worker',
    fields: [
      { name: 'user_email', in: 'query', default: '{email}' },
      { name: 'worker_email', in: 'query', placeholder: 'peer email' },
    ],
  },
  {
    group: 'Messages',
    label: 'Start/resolve chat',
    method: 'POST',
    path: '/messages/start',
    fields: [
      { name: 'user_email', in: 'body', default: '{email}' },
      { name: 'worker_email', in: 'body', placeholder: 'peer email' },
    ],
  },
  {
    group: 'Messages',
    label: 'Thread messages',
    method: 'GET',
    path: '/messages/:chatId/thread',
    fields: [{ name: 'chatId', in: 'path', type: 'number' }],
  },
  {
    group: 'Messages',
    label: 'Send chat message',
    method: 'POST',
    path: '/messages/:chatId/send',
    fields: [
      { name: 'chatId', in: 'path', type: 'number' },
      { name: 'sender_email', in: 'body', default: '{email}' },
      { name: 'recipient_email', in: 'body' },
      { name: 'body', in: 'body', type: 'textarea' },
    ],
  },
  {
    group: 'Messages',
    label: 'Delete conversation',
    method: 'DELETE',
    path: '/messages/:id',
    fields: [{ name: 'id', in: 'path', type: 'number' }],
  },
]

export const GROUPS = Array.from(new Set(ENDPOINTS.map(e => e.group)))
