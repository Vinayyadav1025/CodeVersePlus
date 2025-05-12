# Use Node.js base image
FROM node:16-slim

# Install Python and dependencies for running Python scripts
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev && apt-get clean

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install Node.js dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Nodemon globally
RUN npm install -g nodemon

# Set environment variable for Nodemon to use polling mode (required for Docker on Windows/Mac)
ENV CHOKIDAR_USEPOLLING=true

# Copy the rest of the application files into the container
COPY . .

# Expose the port on which the server runs
EXPOSE 5000

# Run the application with Nodemon
CMD ["nodemon", "server.js"]



# # Build your Docker image (if not already built)
# docker build -t code-runner .

# # Run your Docker container, mapping 5003 on your Mac to 5000 inside the container
# docker run -p 5003:5000 code-runner
