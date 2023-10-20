# Frequentito

An application to inform your teammates at the last moment of your presence at work.

## Contribute

### Run locally
You need docker and docker compose. Then run: 
```sh
make start
```

Then, you can go to https://localhost

### Authentication
This application uses [JWT authentication](https://api-platform.com/docs/core/jwt/) provide by [LexikJWTAuthenticationBundle](https://symfony.com/bundles/LexikJWTAuthenticationBundle/current/index.html).
To make authentication works, you have to generate the public and private keys used for signing JWT tokens for the targeted environment:
```sh
make generate-key-pair
```

