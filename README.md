# Campuseats

## Start With Docker Compose

Run the full stack with one command:

```bash
docker compose up --build
```

Services:

- Client: http://localhost:5173
- Server: http://localhost:5000
- PostgreSQL: localhost:5433

## API Checks

- App health: `GET /health`
- Database health: `GET /db-health`

## Database Files

- Schema: `server/db/schema.sql`
- Seed data: `server/db/seed.sql`

PostgreSQL runs both files automatically the first time the `pgdata` volume is created.
If you want to re-run them from scratch, stop the stack and remove the volume with:

```bash
docker compose down -v
```

## Development Notes

The compose setup runs:

- React client in Vite dev mode
- Express server in nodemon dev mode
- PostgreSQL in a local container with persistent storage