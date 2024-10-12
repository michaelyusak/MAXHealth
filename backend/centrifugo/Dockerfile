# Use the official Centrifugo image as the base image
FROM centrifugo/centrifugo:v5

# Set the working directory
WORKDIR /centrifugo

# Expose the port Centrifugo will use (default is 8000)
EXPOSE 8000

# Start Centrifugo with the configuration file
CMD ["centrifugo", "-c", "config.json"]
