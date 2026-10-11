# Include file with .env variables if exists
-include .env

# Define default values for variables
DK_COMPOSE_FILE ?= docker-compose.yml
DATE=$(shell date +%Y-%m-%d_%H-%M-%S-%p_TZ%Z)

#-----------------------------------------------------------
# System
#-----------------------------------------------------------

sys.time:
	timedatectl

sys.set.time:
	timedatectl set-time $(SYS_CURRENT_TIME)

sys.set.date:
	timedatectl set-time $(SYS_CURRENT_DATE)

sys.set.timezone:
	timedatectl set-timezone $(SYS_CURRENT_TIMEZONE)

sys.all:
	htop

sys.memory:
	vmstat

sys.network:
	netstat -a

sys.disk:
	df -h

#-----------------------------------------------------------
# Git commands
#-----------------------------------------------------------

# Git Commit
git.ci:
	git add .
	git commit -m "Version 5 Initial Update"
	git push

# Git Commit
git.c:
	git add .
	git commit -m "$m"
	git push

# Undo the last commit
git.undo:
	git reset --soft HEAD~1

# Make a Work In Progress commit
git.wip:
	git add .
	git commit -m "WIP"

# Export the codebase as app.zip archive
git.export:
	git archive --format zip --output app.zip master

# Git config list
git.config.list:
	git config --list

# Git config set name
git.set.user:
	git config --global user.name $(GIT_NAME)

# Git config set email
git.set.email:
	git config --global user.email $(GIT_EMAIL)

#-----------------------------------------------------------
# Docker
#-----------------------------------------------------------

# Build and start containers
bup: build up

# Start containers
up:
	docker compose -f ${DK_COMPOSE_FILE} up -d

# Stop containers
down:
	docker compose -f ${DK_COMPOSE_FILE} down --remove-orphans

# Restart containers
r: down up

# Build containers
build:
	docker compose -f ${DK_COMPOSE_FILE} build
	
# Show list of running containers
ps:
	docker compose -f ${DK_COMPOSE_FILE} ps

# Restart containers
restart:
	docker compose -f ${DK_COMPOSE_FILE} restart

# Reboot containers
reboot: down up

# View output logs from containers
logs:
	docker compose -f ${DK_COMPOSE_FILE} logs --tail 500

# Follow output logs from containers
logs.f:
	docker compose -f ${DK_COMPOSE_FILE} logs --tail 500 -f

#-----------------------------------------------------------
# Application
#-----------------------------------------------------------

# Enter the app container
bash-server:
	docker compose -f ${DK_COMPOSE_FILE} exec backend /bin/bash
bash-ai:
	docker compose -f ${DK_COMPOSE_FILE} exec momentum-ai /bin/bash
bash-client:
	docker compose -f ${DK_COMPOSE_FILE} exec client /bin/bash
bash:
	docker compose -f ${DK_COMPOSE_FILE} exec app /bin/bash
perm:
	find /home/"$u"/projects/Momentum -type f -name "*.sh" -exec chmod +x {} \;


#-----------------------------------------------------------
# Danger zone
#-----------------------------------------------------------

# Prune stopped docker containers and dangling images
danger.docker.prune:
	docker system prune
# Remove all existing networks (useful if network already exists with the same attributes)
danger.docker.prune.networks:
	docker network prune

# Remove all unused containers, volumes, networks and images
danger.docker.prune.all:
	docker system prune -af --volumes

# Shut down and remove all volumes
danger.docker.remove.volumes:
	docker-compose down --volumes

danger.remove.docker.cleanup:
	docker system df
	docker system prune -a --volumes
	df -h


