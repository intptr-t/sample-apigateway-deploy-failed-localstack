# Sample API Gateway deployment fails on LocalStack

Issue: <https://github.com/localstack/serverless-localstack/issues/157>

## Reproduction procedure

```bash
npm install
docker-compose -f docker/docker-compose.yml up -d
npx cdklocal bootstrap
npx cdklocal deploy
```

## LICENCSE

- MIT-0
