# GodTasker — Target Sectors & Use Cases

An analysis of which market sectors GodTasker fits today, grounded in what the
product actually does (not what it might do someday). Written 2026-07 against
the current data model and feature set; revisit when payments, categories, or
search ship.

## 1. What the product can actually do

Capabilities, from the data model outward:

- **Tasks** are sent person-to-person by email: name, description, start/due
  dates, a **subtask checklist** (the assignee ticks items; the requester can
  only confirm completion once all are done), **points**, and a **price**.
  Lifecycle: in progress → finished/canceled, with cancel/revive/confirm and a
  "notify assignee" nudge.
- **Offerings** are published service templates: name, description, price,
  **tenure** (duration in days), an optional **photo-confirmation
  requirement**, and their own subtask steps. Requesting an offering spawns a
  task automatically.
- **Social graph**: follow/unfollow, public profiles (avatar, bio, occupation,
  Instagram/LinkedIn links, offerings displayed inline), block/report.
- **Real-time chat** (Socket.IO) between any two users.
- **Dashboard**: overdue / due today / due this week counts, sent-vs-received
  split, finished-percentage.

Hard limits to keep in mind — every sector below is scored against these:

- **No payments.** Price is a display-only number. Money changes hands outside
  the app (Pix, cash, invoice).
- **No categories, tags, or search-by-service.** Discovery is the People
  directory and follow graph only.
- **No scheduling/calendar, no recurring tasks, no file attachments on
  tasks.** Photo confirmation exists only on offerings.
- **Identity is an email address.** Trust signals are limited to
  profile completeness, followers, and block/report.

## 2. How sectors were evaluated

1. **Email-invite fit** — the killer property is that you can send a task to
   anyone whose email you know, with zero onboarding on their side until they
   accept. Sectors where the two parties already know each other score high.
2. **Payment tolerance** — sectors where money is informal (family, favors,
   ongoing relationships) tolerate the no-payments gap; transactional
   marketplaces don't.
3. **Checklist-shaped work** — the subtask checklist + confirm-on-complete
   loop is the core mechanic. Work that decomposes into steps fits; open-ended
   creative judgment fits less.

## 3. The six sectors

### 3.1 Household & errands
**Who:** family members, roommates, neighbors. Delegator = whoever notices the
chore; executor = whoever's available.
**Flow:** "Grocery run — due Saturday 10:00" with a checklist of items; the
runner ticks items off in real time; requester confirms when all are checked.
Chat handles "they're out of oat milk, substitute?"
**Why it fits:** parties know each other (email-invite fit is perfect), money
is informal or absent, groceries/chores are literally checklists.
**Gaps exposed:** no reimbursement/split-cost mechanics; no recurring tasks
(weekly chores must be re-sent).

### 3.2 Freelance & creative services
**Who:** designers, developers, writers, photographers as executors; anyone
hiring them as delegators.
**Flow:** freelancer publishes offerings ("Logo package — $300, 7 days,
photo-confirmed"), keeps a profile with bio + Instagram/LinkedIn as the
portfolio link; a client requests the offering, which spawns a scoped task
with the freelancer's own subtask steps (brief → drafts → revisions → final).
**Why it fits:** offerings are a lightweight storefront; tenure sets delivery
expectations; the checklist makes scope explicit — the #1 freelance pain.
**Gaps exposed:** no discovery (a freelancer can't be found by "logo design"),
no payments to close the deal, no file attachments for deliverables.

### 3.3 Tutoring & lessons
**Who:** tutors, language teachers, music teachers as executors/offerers;
students and parents as requesters.
**Flow:** "10 guitar lessons — 30 days tenure" as an offering; weekly homework
sent as tasks with checklists ("scales ×3, chord changes, record one take");
chat for questions between lessons; points as streak motivation.
**Why it fits:** tutor-student pairs are ongoing relationships (payment
tolerance high), homework is checklist-shaped, tenure maps to lesson packages.
**Gaps exposed:** no calendar/scheduling for the lessons themselves, no
recurrence for weekly assignments.

### 3.4 Small-business delegation
**Who:** owner-operators delegating to virtual assistants, contractors, or
part-time help.
**Flow:** owner sends "Update the product photos" with a due date and a
checklist of steps to a VA's email — the VA needs no training on an internal
tool; the owner's dashboard shows what's overdue across everyone they've
tasked.
**Why it fits:** zero-onboarding email tasking beats setting up Asana for a
two-person operation; the dashboard's overdue/due-today counts are exactly an
owner's oversight view.
**Gaps exposed:** no teams/roles (everything is 1:1), no attachments, no
templates for repeat processes (offerings partially cover this).

### 3.5 Family & caregiving coordination
**Who:** adult children coordinating care for aging parents; the original
"grandma helpers" persona. Delegators = the family; executors = relatives,
neighbors, hired helpers.
**Flow:** "Take Dad to his cardiology appointment — Tuesday 14:00" with a
checklist (meds list, insurance card, ask about dosage); a helper's offering
"Weekly check-in visit — photo-confirmed" gives the family proof-of-done.
**Why it fits:** high-trust known network, informal money, tasks where
*confirmation that it happened* is the product's emotional core — photo
confirmation is uniquely valuable here.
**Gaps exposed:** trust/verification is thin for hired (non-family) helpers;
no shared family view (tasks are 1:1, so siblings can't all see Mom's care
board).

### 3.6 Fitness & coaching
**Who:** personal trainers, nutrition coaches, habit coaches as offerers;
clients as requesters.
**Flow:** "8-week coaching block — 56 days tenure" as an offering; each week's
plan arrives as a task checklist ("3 workouts, 10k steps daily, meal log");
points accumulate as the compliance/gamification layer; chat for form checks.
**Why it fits:** coaching is delivered as recurring checklists with
accountability — the confirm-on-complete loop *is* the accountability.
**Gaps exposed:** no progress history/charts, no media in task updates (form
videos go through other channels), no recurrence.

## 4. Prioritization

| Sector | Email-invite fit | Payment tolerance | Checklist fit | Verdict |
|---|---|---|---|---|
| Household & errands | ●●● | ●●● | ●●● | **Beachhead** |
| Family & caregiving | ●●● | ●●● | ●●● | **Beachhead** |
| Freelance & creative | ●●○ | ●○○ | ●●○ | Featured, needs payments |
| Small-business delegation | ●●● | ●●○ | ●●○ | Fast follow |
| Tutoring & lessons | ●●○ | ●●○ | ●●● | Fast follow |
| Fitness & coaching | ●●○ | ●●○ | ●●● | Fast follow |

**Recommendation:** lead with **household/family** use cases (both beachheads
share one growth loop — every task sent to a non-user email is an invite from
someone they trust) while *featuring* freelance/coaching to signal the earning
side of the marketplace. Don't promise discovery or payments in marketing copy
until they exist.

## 5. Roadmap implications

What the sector analysis says to build, in rough order of unlock value:

| Gap | Blocks | Notes |
|---|---|---|
| Recurring tasks | Household, tutoring, fitness | Biggest cross-sector unlock; chores/homework/plans are all weekly |
| Payments (Pix first, given the BR audience) | Freelance, tutoring, coaching | Converts "storefront" into "marketplace" |
| Categories/tags + offering search | Freelance discovery | Prereq for any stranger-to-stranger matching |
| File/photo attachments on tasks | Freelance deliverables, fitness | Photo-confirm exists on offerings; generalize it |
| Task reminders/notifications | All | Server already has FCM push for mobile; surface on web |
| Shared/group task views | Family care, small business | Moves beyond strict 1:1 tasking |
