.PHONY: help

help : Makefile
	@sed -n 's/^##//p' $<

default: up

## up	:	Build and start containers.
up:
	@echo "Starting up containers..."
	docker compose up -d --remove-orphans --build

## build	:	Build containers.
build: 
	@echo "Build up containers..."
	@docker compose --build

## start	:	Start containers.
start: 
	@echo "Starting up containers..."
	@docker compose start

## down	:	Stop containers.
down: stop

## stop	:	Stop containers.
stop: 
	@echo "Stopping containers..."
	@docker compose stop

## down	:	Stop containers.
down: stop

## generate-key-pair	: Genererate public and private keys for JWT authentication.
generate-key-pair:
	@echo "Generating key-pair..."
	@docker compose exec php sh -c "set -e && apk add openssl && php bin/console lexik:jwt:generate-keypair --overwrite && setfacl -R -m u:www-data:rX -m u:"$(whoami)":rwX config/jwt && setfacl -dR -m u:www-data:rX -m u:"$(whoami)":rwX config/jwt"

## prune	:	Remove containers and their volumes.
##		You can optionally pass an argument with the service name to prune single container
##		prune php	: Prune `php` container and remove its volumes.
##		prune php database	: Prune `php` and `database` containers and remove their volumes.
prune:
	@echo "Removing containers..."
	@docker compose down -v $(filter-out $@,$(MAKECMDGOALS))

## shell	:	Access a container via shell.
##		You have to pass an argument with a service name to open a shell on the specified container
##		shell php	: Access `php` shell container.
##		shell pwa	: Access `pwa` shell container.
##		shell database	: Access `database` shell container.
shell:
	docker compose exec $(filter-out $@,$(MAKECMDGOALS)) sh

## logs	:	View containers logs.
##		You can optinally pass an argument with the service name to limit logs
##		logs php	: View `php` container logs.
##		logs pwa php	: View `pwa` and `php` containers logs.
logs:
	@docker compose logs -f $(filter-out $@,$(MAKECMDGOALS))

## symfony	:	Run Symfony command.
##		You have to pass an argument with the command to run
##		symfony make:migration	: Make a new Doctrine migration.
##		symfony doctrine:migrations:migrate	: Run Doctrine migrations.
##		symfony d:m:m	: Run Doctrine migrations.
symfony:
	docker compose exec php sh -c "set -e && php bin/console $(filter-out $@,$(MAKECMDGOALS))"

# https://stackoverflow.com/a/6273809/1826109
# Allows to pass arguments to targets
%:
	@: