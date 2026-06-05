# eru — Frontend

eru is a learning-focused scrolling platform built as a React single-page
application. Users can browse short facts, theories, and quotes, save their
interactions, search for specific content, and ask for an AI-generated elaboration
through the backend.

**Live:** https://frontend.eru-api.dk  

**Backend routes:** https://eru-api.dk/api/v1/routes  

**Frontend repository:** https://github.com/saldic/eruFront  

**Backend repository:** https://github.com/saldic/eru  

**Portfolio:** https://www.dinosaldic.dk/projects/eru-project/

**Project Overview Video** https://drive.google.com/drive/folders/11miq5ZiHGOEkeZKAQC2lV419AwaSLrsV

---

## Features

- Register, login, logout, and restore a JWT-based session
- Protected routes for authenticated users
- Learning feed with `FACT`, `THEORY`, and `QUOTE` filters
- Interaction overview grouped by liked, bookmarked, disliked, and viewed content
- Explore page with search, author, category, and content-type filters
- Clickable content cards with dedicated detail pages
- AI elaboration through the backend OpenAI endpoint
- Admin page for creating, editing, deleting, and searching content


---

## Roles and Access

| Role | Access |
|---|---|
| `USER` | Feed, explore, content detail, interactions, like/dislike/bookmark, elaborate |
| `ADMIN` | All user features plus content administration |

The backend remains the real security boundary. Admin write endpoints require an
authenticated user with the `ADMIN` role.

---

## Routes

Key application routes are defined in `src/routes.jsx`.

| Route | Access | Purpose |
|---|---|---|
| `/auth/login` | Public | Login form |
| `/auth/register` | Public | Registration form |
| `/` | USER | Redirected/protected feed entry |
| `/feed` | USER | Main learning feed |
| `/explore` | USER | Search and filter all active content |
| `/content/:contentId` | USER | Single content detail page |
| `/interactions` | USER | Personal interaction overview |
| `/admin` | ADMIN | Manage eru content |

---

## Project Structure

```text
src/
  components/
    admin/          Admin content form and list item
    auth/           Auth panel, login form, register form
    content/        Shared content search component
    feed/           Content cards, viewer, and filter tabs
    feedback/       Toast notification component
    interactions/   Interaction overview list item
    layout/         Header, brand mark, splash screen, landing visuals
  pages/            Route-level pages
  routes/           ProtectedRoute wrapper
  utils/            Search and validation helpers
  App.jsx           Global auth/session/toast state
  eruApi.js         API facade, JWT storage, request handling
  routes.jsx        Application route structure
  styles.css        Shared responsive styling
```

The project intentionally keeps the structure simple. Most state belongs to the
page that owns the workflow, while shared API logic is kept in `src/eruApi.js`.

---

## Backend Endpoints Used

| Purpose | Method | Endpoint |
|---|---|---|
| Register | `POST` | `/auth/register` |
| Login | `POST` | `/auth/login` |
| Restore current user | `GET` | `/auth/me` |
| Load unseen feed | `GET` | `/content/feed?type=FACT` |
| Load active content | `GET` | `/content?activeOnly=true` |
| Load one content item | `GET` | `/content/{id}` |
| Load own interactions | `GET` | `/interactions/me` |
| Save interaction | `POST` | `/content/{id}/interactions` |
| Remove interaction | `DELETE` | `/content/{id}/interactions?reactionType=LIKE` |
| Elaborate content | `POST` | `/content/{id}/elaborate` |
| Load all content for admin | `GET` | `/content?activeOnly=false` |
| Create content | `POST` | `/content` |
| Update content | `PUT` | `/content/{id}` |
| Delete content | `DELETE` | `/content/{id}` |

---

## Authentication Notes

- JWT tokens are stored in `localStorage` under the key `eruToken`.
- The token is sent as `Authorization: Bearer <token>` on protected requests.
- The frontend decodes the token payload to read roles and expiration time.
- Expired tokens are removed locally before authenticated requests are made.
- Token decoding in the frontend is only used for UI/session handling. The backend
  validates the token and enforces authorization.

---


### Start the dev server

```bash
npm run dev
```

The app runs at:

```text
http://localhost:5173
```


## Deployment

The frontend follows the deployment setup from the semester material: GitHub
Actions builds the Vite project and deploys the static `dist/` files to a
DigitalOcean droplet. Caddy serves the built frontend.

The deployed frontend is served from:

```text
https://frontend.eru-api.dk
```

### GitHub Actions

Deployment runs from `.github/workflows/deploy.yml` when changes are pushed to
`main`.

The workflow:

1. Checks out the repository
2. Installs dependencies with `npm ci`
3. Builds the project with `npm run build`
4. Copies `dist/` to the droplet with `rsync`
