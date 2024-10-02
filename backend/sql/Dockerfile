# Use the PostGIS base image
FROM postgis/postgis:latest

# Environment variables for Postgres
ENV POSTGRES_USER=maxhealth-postgres
ENV POSTGRES_PASSWORD=nd4sTy12m7s@!
ENV POSTGRES_DB=max_health_db

# Copy initialization SQL files into Docker container
# These SQL files will be executed when the container starts
COPY ddl.sql /docker-entrypoint-initdb.d/1.sql
COPY dml.sql /docker-entrypoint-initdb.d/2.sql
COPY cities-dml.sql /docker-entrypoint-initdb.d/3.sql
COPY pharmacy-sample-dml.sql /docker-entrypoint-initdb.d/4.sql
COPY drugs-dml.sql /docker-entrypoint-initdb.d/5.sql
COPY pharmacy-geom.sql /docker-entrypoint-initdb.d/6.sql
# COPY pharmacy_operational_ddl-1.sql /docker-entrypoint-initdb.d/7.sql
COPY pharmacy-drugs-sample-dml.sql /docker-entrypoint-initdb.d/8.sql

# Expose the Postgres port
EXPOSE 5432
