# My "Hello, world!" project

To run you need:

```bash
docker-compose up -d

# After the first run
docker exec -it todo_app npm run db:create
docker exec -it todo_app npm run db:migrate
```
